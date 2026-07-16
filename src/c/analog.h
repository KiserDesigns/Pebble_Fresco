#pragma once
#include <pebble.h>
#include "src/c/layerinfo.h"

void draw_analog(GContext * ctx, LayerInfo * layer, struct tm * localtime);
