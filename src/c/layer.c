#include <pebble.h>
#include "layer.h"

GFont font(uint8_t fontsettings){
  switch (fontsettings&0x1F) { //5 bits = 32 possible fonts
  case 1:
    return fonts_get_system_font(FONT_KEY_GOTHIC_14);
  case 2:
    return fonts_get_system_font(FONT_KEY_GOTHIC_14_BOLD);
  case 3:
    return fonts_get_system_font(FONT_KEY_GOTHIC_18);
  case 4:
    return fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD);
  case 5:
    return fonts_get_system_font(FONT_KEY_GOTHIC_24);
  case 6:
    return fonts_get_system_font(FONT_KEY_GOTHIC_24_BOLD);
  case 7:
    return fonts_get_system_font(FONT_KEY_GOTHIC_28);
  case 8:
    return fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD);
  case 9:
    return fonts_get_system_font(FONT_KEY_BITHAM_30_BLACK);
  case 10:
    return fonts_get_system_font(FONT_KEY_BITHAM_34_MEDIUM_NUMBERS);
  case 11:
    return fonts_get_system_font(FONT_KEY_BITHAM_42_BOLD);
  case 12:
    return fonts_get_system_font(FONT_KEY_BITHAM_42_LIGHT);
  case 13:
    return fonts_get_system_font(FONT_KEY_BITHAM_42_MEDIUM_NUMBERS);
  case 14:
    return fonts_get_system_font(FONT_KEY_ROBOTO_CONDENSED_21);
  case 15:
    return fonts_get_system_font(FONT_KEY_ROBOTO_BOLD_SUBSET_49);
  case 16:
    return fonts_get_system_font(FONT_KEY_DROID_SERIF_28_BOLD);
  case 17:
    return fonts_get_system_font(FONT_KEY_LECO_20_BOLD_NUMBERS);
  case 18:
    return fonts_get_system_font(FONT_KEY_LECO_26_BOLD_NUMBERS_AM_PM);
  case 19:
    return fonts_get_system_font(FONT_KEY_LECO_28_LIGHT_NUMBERS);
  case 20:
    return fonts_get_system_font(FONT_KEY_LECO_32_BOLD_NUMBERS);
  case 21:
    return fonts_get_system_font(FONT_KEY_LECO_36_BOLD_NUMBERS);
  case 22:
    return fonts_get_system_font(FONT_KEY_LECO_38_BOLD_NUMBERS);
  case 23:
    return fonts_get_system_font(FONT_KEY_LECO_42_NUMBERS);
  case 24:
    #ifdef FONT_KEY_LECO_60_NUMBERS_AM_PM
    return fonts_get_system_font(FONT_KEY_LECO_60_NUMBERS_AM_PM);
    #else
    return fonts_get_system_font(FONT_KEY_LECO_42_NUMBERS);
    #endif
  case 25:
    #ifdef FONT_KEY_LECO_60_NUMBERS_AM_PM
    return fonts_get_system_font(FONT_KEY_LECO_60_BOLD_NUMBERS_AM_PM);
    #else
    return fonts_get_system_font(FONT_KEY_LECO_42_NUMBERS);
    #endif
    
  default: return fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD);
  }
}

GTextOverflowMode overflow(uint8_t fontsettings){
  if (fontsettings&0x80){ //high bit set when word-wrap is enabled
    return GTextOverflowModeWordWrap;
  } else {
    return GTextOverflowModeTrailingEllipsis;
  }
}

GTextAlignment alignment(uint8_t fontsettings){
  switch ((fontsettings&0x60)>>5) { // 0-3, based on bits 6 and 7
  case 1:
    return GTextAlignmentLeft;
  case 2:
    return GTextAlignmentCenter;
  case 3:
    return GTextAlignmentRight;

  default: return GTextAlignmentCenter;
  }
}

uint8_t build_font_settings(uint8_t font_selection, GTextAlignment alignment, GTextOverflowMode overflow){
  uint8_t align;
  if (alignment==GTextAlignmentLeft) {
    align = 1;
  } else if (alignment==GTextAlignmentRight) {
    align = 3;
  } else {
    align = 2;
  }
  //high bit (8) is set when word-wrap is enabled
  //bits 6-7 for the Alignment
  //bits 1-5 for the font selection.
  return (font_selection&0x1F)|((align&3)<<5)|(overflow==GTextOverflowModeWordWrap?0x80:0x00);
}

bool prv_in_rect(int w, int h, uint16_t radius, uint16_t x, uint16_t y){
  if(radius==0){
    return true;
  }
  if (radius > w/2) {radius = w/2;}
  if (radius > h/2) {radius = h/2;}
  if ((x>radius && x<w-radius-1) || (y>radius && y<h-radius-1)){
    return true;
  }
  
  
  if (y>=h/2){
      y = h-1-y;
    }
  if (x>=w/2){
      x = w-1-x;
    }
  
  if (radius <= 8){
    static const uint32_t round_top_corner_lookup[] = {
      0x0, 0x01, 0x01, 0x12, 0x113, 0x123, 0x1234, 0x11235, 0x112346,
    };
    APP_LOG (APP_LOG_LEVEL_INFO, "x=%u, y=%u, mask=%u", x, y, 0x0F&&(round_top_corner_lookup[radius] >> (4*y)));
    if (x >= (0x0F&(round_top_corner_lookup[radius] >> (4*y)))){
      return true;
    }
  } else {
    if (radius*(radius+1) >= (radius-x)*(radius-x) + (radius-y)*(radius-y)){
      return true;
    }
  }
  
  
  return false;
}

static bool byte_get_bit(uint8_t *byte, uint8_t bit) {
  return ((*byte) >> bit) & 1;
}

static void byte_set_bit(uint8_t *byte, uint8_t bit, uint8_t value) {
  *byte ^= (-value ^ *byte) & (1 << bit);
}

static void set_pixel_color(GBitmapDataRowInfo info, GPoint point, GColor color) {
#if defined(PBL_COLOR)
  // Write the pixel's byte color
  memset(&info.data[point.x], color.argb, 1);
#elif defined(PBL_BW)
  // Find the correct byte, then set the appropriate bit
  uint8_t byte = point.x / 8;
  uint8_t bit = point.x % 8; 
  byte_set_bit(&info.data[byte], bit, gcolor_equal(color,GColorWhite) ? 1 : 0);
#endif
}

static GColor get_pixel_color(GBitmapDataRowInfo info, GPoint point) {
#if defined(PBL_COLOR)
  // Read the single byte color pixel
  return (GColor){ .argb = info.data[point.x] };
#elif defined(PBL_BW)
  // Read the single bit of the correct byte
  uint8_t byte = point.x / 8;
  uint8_t bit = point.x % 8; 
  return byte_get_bit(&info.data[byte], bit) ? GColorWhite : GColorBlack;
#endif
}

void draw_layer(GContext * ctx, LayerInfo * layer, time_t time){
  if (layer->Type == TYPE_RECT || layer->Type == TYPE_TEXT){
    if (!gcolor_equal(layer->BackgroundColor, GColorClear) && !(layer->LayerSettings&DITHER_MASK)){
      //if the background color is not clear, draw a background
      graphics_context_set_fill_color(ctx, layer->BackgroundColor);
      graphics_fill_rect(ctx, layer->Rect, layer->Radius, GCornersAll);
    }
    if (layer->LayerSettings&DITHER_MASK){
      static const uint8_t bayer8x8[8][8] = {
        {0,  32, 8,  40, 2,  34, 10, 42},
        {48, 16, 56, 24, 50, 18, 58, 26},
        {12, 44, 4,  36, 14, 46, 6, 38},
        {60, 28, 52, 20, 62, 30, 54, 22},
        {3,  35, 11, 43, 1,  33, 9,  41},
        {51, 19, 59, 27, 49, 17, 57, 25}, 
        {15, 47, 7,  39, 13, 45, 5,  37},
        {63, 31, 55, 23, 61, 29, 53, 21}
      };
      
      int w = layer->Rect.size.w;
      int h = layer->Rect.size.h;
      for(int x = 0; x<w; x++){
        for(int y = 0; y<h; y++){
          if (prv_in_rect(w, h, layer->Radius, (uint16_t)x, (uint16_t)y)){
            GColor stroke_color;
            if ((layer->LayerSettings&DITHER_MASK) == DITHER_MIX){
              if ((x+y)%2){
                stroke_color = layer->ForegroundColor;
              } else {
                stroke_color = layer->BackgroundColor;
              }
              if (!gcolor_equal(stroke_color, GColorClear)){
                graphics_context_set_stroke_color(ctx, stroke_color);
                graphics_draw_pixel(ctx, GPoint(layer->Rect.origin.x + x, layer->Rect.origin.y + y));
              }
            } else {
              int threshold = 0;
              if ((layer->LayerSettings&DITHER_MASK) == DITHER_LR){
                threshold = (x * 64) / (w-1);
              } else {
                  threshold = (y * 64) / (h-1);
              }
              int bayer = bayer8x8[x%8][y%8];
              if (threshold > bayer){
                stroke_color = layer->ForegroundColor;
              } else {
                stroke_color = layer->BackgroundColor;
              }
              if (!gcolor_equal(stroke_color, GColorClear)){
                graphics_context_set_stroke_color(ctx, stroke_color);
                graphics_draw_pixel(ctx, GPoint(layer->Rect.origin.x + x, layer->Rect.origin.y + y));
              }
            }
          }
        }
      }
    }
    if (layer->LayerSettings&DRAW_OUTLINE){
      //if the DRAW_OUTLINE bit is set, draw an outline in the ForegroundColor
      graphics_context_set_stroke_color(ctx, layer->ForegroundColor);
      graphics_draw_round_rect(ctx, layer->Rect, layer->Radius);
    }
    if (layer->Type == TYPE_TEXT){
      graphics_context_set_text_color(ctx, layer->ForegroundColor);
      static char text[100];
      static char text2[100];
      //add date/time where specified
      struct tm *tick_time = localtime(&time);
      formattimewords(text2, sizeof(text2), layer->Content, time);
      strftime(text, sizeof(text), text2, tick_time);
      //draw it
      graphics_draw_text(ctx, text, font(layer->FontSettings), layer->Rect, overflow(layer->FontSettings), alignment(layer->FontSettings), (GTextAttributes *)0);
    }
    if (layer->LayerSettings&INVERTER){
      GBitmap *fb = graphics_capture_frame_buffer(ctx);
      // Iterate over all rows
      int i = layer->Rect.origin.x;
      int j = layer->Rect.origin.y;
      int w = layer->Rect.size.w;
      int h = layer->Rect.size.h;
      for(int y = j; y < j+h; y++) {
        // Get this row's range and data
        if (y>=0 && y<PBL_DISPLAY_HEIGHT) {
          GBitmapDataRowInfo info = gbitmap_get_data_row_info(fb, y);
          // Iterate over all visible columns
          for(int x = i; x < i+w; x++) {
            // Manipulate the pixel at x,y...
            GColor pixel_color = get_pixel_color(info, GPoint(x, y)); 
            pixel_color.argb ^= 0x3F;
            if(x >= info.min_x && x <= info.max_x && \
               prv_in_rect(w, h, layer->Radius, x-i, y-j)){
              set_pixel_color(info, GPoint(x, y), pixel_color);
            }
          }
        }
      }
      graphics_release_frame_buffer(ctx, fb);
    }
  }
  if (layer->Type == TYPE_ANALOG){
    draw_analog(ctx, layer, localtime(&time));
  }
  if (layer->Type == TYPE_IMAGE){
    draw_image(ctx, layer);
  }
}

