#pragma once
#include <pebble.h>
#include "src/c/layerinfo.h"

void draw_analog(GContext * ctx, LayerInfo * layer, struct tm * localtime);


uint32_t build_tick_settings(uint8_t radius, GColor major_color, uint8_t major_length, uint8_t major_thickness,\
                           GColor minor_color, uint8_t minor_length, uint8_t minor_thickness);
