#include <pebble.h>
#include "images.h"

/**

typedef struct LayerInfo {
  GRect Rect; // bounds of the image
  uint32_t LayerSettings; //
  uint32_t ContentSettings; //4-byte hash to request from phone for full-res data
  uint16_t Radius; //Starting block
  uint8_t DynamicMask; //Starting byte
  GColor BackgroundColor; //
  GColor ForegroundColor; //
  uint8_t Type; //
  uint8_t FontSettings; // Scale factor
  char Content[41]; //argb of the colors that each piece of image data represents for bit depths 1, 2, and 4
} LayerInfo;

**/

void draw_image(GContext * ctx, LayerInfo * layer){
  ImageBlock data;
  uint16_t block = layer->Radius;
  uint8_t byte = layer->DynamicMask;
  uint8_t bit = 0;
  uint32_t bit_depth = (layer->LayerSettings&BIT_DEPTH_MASK);
  int w = layer->Rect.size.w;
  int h = layer->Rect.size.h;
  GColor color;
  int scale = layer->FontSettings!=0?layer->FontSettings:1;
  
  persist_read_data(IMAGE_BLOCK_KEY_ITERATION*NUM_IMAGE_BLOCKS+block,&data, sizeof(ImageBlock));
  for(int y = 0; y<h; y++){
    for(int x = 0; x<w; x++){

      if (bit_depth == BIT_DEPTH_4) {
        color = (GColor8){.argb=(layer->Content[((data.pixels[byte])>>(4-bit))&0x0F])};
        bit = bit+4;
      } else if (bit_depth == BIT_DEPTH_1) {
        color = (GColor8){.argb=(layer->Content[((data.pixels[byte])>>(7-bit))&0x01])};
        bit = bit+1;
      } else if (bit_depth == BIT_DEPTH_2) {
        color = (GColor8){.argb=(layer->Content[((data.pixels[byte])>>(6-bit))&0x03])};
        bit = bit+2;
      } else if (bit_depth == BIT_DEPTH_8) {
        color = (GColor8){.argb=(data.pixels[byte])};
        bit = 8;
      }
      if (bit==8){
        bit = 0;
        byte = byte+1;
        if (byte==0){
          block = block+1;
          persist_read_data(IMAGE_BLOCK_KEY_ITERATION*NUM_IMAGE_BLOCKS+block,&data, sizeof(ImageBlock));
        }
      }
      if (!gcolor_equal(color, GColorClear)){
        graphics_context_set_stroke_color(ctx, color);
        for (int i = 0; i < scale; i++){
          for (int j = 0; j < scale; j++){
            graphics_draw_pixel(ctx, GPoint(layer->Rect.origin.x + scale*x + i, layer->Rect.origin.y + scale*y + j));
          }
        }
      }
    }
  }
}