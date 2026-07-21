#pragma once
#include <pebble.h>
#include "src/c/layerinfo.h"



// Max number of image blocks
#define NUM_IMAGE_BLOCKS 8
#define IMAGE_BLOCK_KEY_ITERATION 1

#define COLOR_MODE_MASK 0x02
#define MODE_COLOR 0x02

//image data:

typedef struct ImageBlock {
  uint8_t pixels[256]; // pixel data. For b/w, each bit is a pixel, high on left and low on right, wrapping.
                       // for color, each nibble represents a selection from the 16-color pallete in gcolor_pallete[16];
} ImageBlock;

void draw_image(GContext * ctx, LayerInfo * layer);