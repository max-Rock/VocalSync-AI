def hex_to_ass_color(hex_str, opacity_pct=100):
    hex_str = hex_str.lstrip('#')
    r, g, b = hex_str[0:2], hex_str[2:4], hex_str[4:6]
    # ASS alpha: 00 is opaque, FF is transparent
    alpha = int((1 - (opacity_pct / 100)) * 255)
    return f"&H{alpha:02X}{b}{g}{r}"

print(hex_to_ass_color("#FF5500", 60))
print(hex_to_ass_color("#000000", 60))
print(hex_to_ass_color("#FFFFFF", 100))
