"""Leitura e normalização segura de imagens enviadas pelo usuário.

Este módulo concentra as defesas do upload:

* leitura em blocos com teto de bytes, evitando carregar arquivos gigantes na
  memória antes de descobrir que são grandes demais;
* rejeição de formatos não suportados a partir do conteúdo real do arquivo,
  não do nome ou do `Content-Type` informado pelo cliente;
* proteção contra *decompression bombs* (arquivos pequenos que se expandem
  para centenas de megapixels ao serem decodificados);
* reamostragem e reencode para JPEG, o que reduz o custo de tokens e remove
  metadados EXIF — incluindo coordenadas de GPS — antes de enviar a foto a um
  serviço de terceiros.
"""

from __future__ import annotations

import io
import logging

from PIL import Image, ImageOps, UnidentifiedImageError

logger = logging.getLogger(__name__)

# Formatos que aceitamos decodificar. Deliberadamente restrito.
ALLOWED_FORMATS = frozenset({"JPEG", "PNG", "WEBP", "GIF", "BMP"})

# Tamanho dos blocos lidos do upload.
CHUNK_SIZE = 64 * 1024

JPEG_QUALITY = 85


class ImageTooLargeError(Exception):
    """O upload excedeu o número máximo de bytes permitido."""


class InvalidImageError(Exception):
    """O conteúdo enviado não é uma imagem válida ou suportada."""


async def read_upload(file, max_bytes: int) -> bytes:
    """Lê o upload em blocos, abortando assim que o limite é ultrapassado.

    Args:
        file: `UploadFile` (ou qualquer objeto com `read` assíncrono).
        max_bytes: Número máximo de bytes aceitos.

    Returns:
        O conteúdo completo do arquivo.

    Raises:
        ImageTooLargeError: Se o conteúdo exceder `max_bytes`.
        InvalidImageError: Se o arquivo estiver vazio.
    """
    buffer = bytearray()
    while True:
        chunk = await file.read(CHUNK_SIZE)
        if not chunk:
            break
        buffer.extend(chunk)
        if len(buffer) > max_bytes:
            raise ImageTooLargeError(
                f"Imagem maior que o limite de {max_bytes // (1024 * 1024)} MB."
            )

    if not buffer:
        raise InvalidImageError("Nenhum arquivo foi enviado.")

    return bytes(buffer)


def normalize_image(
    raw: bytes,
    *,
    max_pixels: int,
    max_dimension: int,
) -> tuple[bytes, str]:
    """Valida a imagem e devolve uma versão normalizada em JPEG.

    Args:
        raw: Bytes originais do upload.
        max_pixels: Área máxima aceita (largura x altura) antes da reamostragem.
        max_dimension: Maior lado permitido na imagem de saída.

    Returns:
        Uma tupla `(bytes_jpeg, mime_type)` pronta para envio ao modelo.

    Raises:
        InvalidImageError: Se o conteúdo não for uma imagem suportada ou se
            exceder o limite de pixels.
    """
    # `Image.open` é preguiçoso: o cabeçalho basta para conferir formato e
    # dimensões antes de gastar memória decodificando os pixels.
    try:
        with Image.open(io.BytesIO(raw)) as probe:
            image_format = (probe.format or "").upper()
            width, height = probe.size
    except UnidentifiedImageError as exc:
        raise InvalidImageError(
            "O arquivo enviado não é uma imagem válida."
        ) from exc
    except Image.DecompressionBombError as exc:
        raise InvalidImageError("Imagem com resolução excessiva.") from exc
    except Exception as exc:  # arquivo truncado, cabeçalho corrompido, etc.
        raise InvalidImageError("Não foi possível ler a imagem enviada.") from exc

    if image_format not in ALLOWED_FORMATS:
        raise InvalidImageError(
            f"Formato '{image_format or 'desconhecido'}' não suportado. "
            f"Use {', '.join(sorted(ALLOWED_FORMATS))}."
        )

    if width * height > max_pixels:
        raise InvalidImageError(
            f"Imagem com {width}x{height} pixels excede o limite permitido."
        )

    try:
        with Image.open(io.BytesIO(raw)) as image:
            # Respeita a orientação gravada no EXIF antes de descartá-lo.
            image = ImageOps.exif_transpose(image)
            image.thumbnail((max_dimension, max_dimension), Image.LANCZOS)

            # JPEG não tem canal alfa; achatamos sobre branco para evitar
            # que PNGs transparentes virem fundo preto.
            if image.mode in ("RGBA", "LA", "P"):
                image = image.convert("RGBA")
                background = Image.new("RGB", image.size, (255, 255, 255))
                background.paste(image, mask=image.split()[-1])
                image = background
            elif image.mode != "RGB":
                image = image.convert("RGB")

            output = io.BytesIO()
            # `exif` não é repassado: metadados de localização ficam de fora.
            image.save(output, format="JPEG", quality=JPEG_QUALITY, optimize=True)
    except Image.DecompressionBombError as exc:
        raise InvalidImageError("Imagem com resolução excessiva.") from exc
    except OSError as exc:
        raise InvalidImageError("Imagem corrompida ou incompleta.") from exc

    normalized = output.getvalue()
    logger.debug(
        "Imagem normalizada: %s %dx%d (%d bytes) -> JPEG (%d bytes)",
        image_format,
        width,
        height,
        len(raw),
        len(normalized),
    )
    return normalized, "image/jpeg"
