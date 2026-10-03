# app/utils/qr.py

from io import BytesIO

import qrcode
from qrcode.constants import ERROR_CORRECT_M


def generate_ticket_qr(ticket_code: str) -> bytes:
    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )

    qr.add_data(ticket_code)
    qr.make(fit=True)

    image = qr.make_image(
        fill_color="black",
        back_color="white",
    )

    buffer = BytesIO()
    image.save(buffer, format="PNG")

    return buffer.getvalue()