#pragma once
#include <pebble.h>
#include "src/c/layerinfo.h"



// Max number of image blocks
#define NUM_IMAGE_BLOCKS 8
#define IMAGE_BLOCK_KEY_ITERATION 1

#define BIT_DEPTH_MASK 0x06
#define BIT_DEPTH_1 0x00
#define BIT_DEPTH_2 0x02
#define BIT_DEPTH_4 0x04
#define BIT_DEPTH_8 0x06

//image data:

typedef struct ImageBlock {
  uint8_t pixels[256]; // pixel data. For b/w, each bit is a pixel, high on left and low on right, wrapping.
                       // for color, each nibble represents a selection from the 16-color pallete in gcolor_pallete[16];
} ImageBlock;

void draw_image(GContext * ctx, LayerInfo * layer);