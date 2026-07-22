#include <pebble.h>
#include "images.h"

/**

typedef struct LayerInfo {
  GRect Rect; // bounds of the image
  uint32_t LayerSettings; //
  uint32_t ContentSettings; //4-byte hash to request from phone for full-res data
  uint16_t Radius; //Starting byte. /256 to get block offset, and %256 to get starting byte within block
  uint8_t DynamicMask; //1
  GColor BackgroundColor; //Color of 0's in a 1-bpp image
  GColor ForegroundColor; //Color of 1's in a 1-bpp image
  uint8_t Type; //
  uint8_t FontSettings; // Scale factor
  char Content[41]; //first 16 are the colors that each nibble represent
} LayerInfo;

**/

void draw_image(GContext * ctx, LayerInfo * layer){
  ImageBlock data;
  uint8_t block = layer->Radius/256;
  uint8_t byte = layer->Radius%256;
  uint8_t bit = 0;
  bool bit_depth = (layer->LayerSettings&BIT_DEPTH_MASK);
  int w = layer->Rect.size.w;
  int h = layer->Rect.size.h;
  GColor color;
  int scale = layer->FontSettings!=0?layer->FontSettings:1;
  
  if (byte!=0){
    persist_read_data(IMAGE_BLOCK_KEY_ITERATION*NUM_IMAGE_BLOCKS+block,&data, sizeof(ImageBlock));
  }
  for(int y = 0; y<h; y++){
    for(int x = 0; x<w; x++){
      if (byte==0){
        persist_read_data(IMAGE_BLOCK_KEY_ITERATION*NUM_IMAGE_BLOCKS+block,&data, sizeof(ImageBlock));
        block = block+1;
      }
      if (is_color) {
        color = (GColor8){.argb=(layer->Content[((data.pixels[byte])>>(4-bit))&0x0F])};
        bit = bit+4;
        if (bit==8){
          bit = 0;
          byte = byte+1;
        }
      } else {
        color = ((data.pixels[byte])>>(7-bit))&0x01?layer->BackgroundColor:layer->ForegroundColor;
        bit = bit+1;
        if (bit==8){
          bit = 0;
          byte = byte+1;
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