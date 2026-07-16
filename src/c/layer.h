#pragma once
#include "src/c/format.h"
#include "src/c/images.h"
#include "src/c/analog.h"
#include "src/c/layerinfo.h"

void draw_layer(GContext * ctx, LayerInfo * layer, time_t time);

uint8_t build_font_settings(uint8_t font_selection, GTextAlignment alignment, GTextOverflowMode overflow);
