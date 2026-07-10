#include <pebble.h>
#include "layerinfo.h"

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

void draw_layer(GContext * ctx, LayerInfo * layer){
  if (layer->Type == TYPE_RECT || layer->Type == TYPE_TEXT){
    if (!gcolor_equal(layer->BackgroundColor, GColorClear)){
      //if the background color is not clear, draw a background
      graphics_context_set_fill_color(ctx, layer->BackgroundColor);
      graphics_fill_rect(ctx, layer->Rect, layer->Radius, GCornersAll);
    }
    if (layer->LayerSettings&DRAW_OUTLINE){
      //if the DRAW_OUTLINE bit is set, draw an outline in the ForegroundColor
      graphics_context_set_stroke_color(ctx, layer->ForegroundColor);
      graphics_draw_round_rect(ctx, layer->Rect, layer->Radius);
    }
  }
  if (layer->Type == TYPE_TEXT){
    graphics_context_set_text_color(ctx, layer->ForegroundColor);
    static char text[100];
    //add date/time where specified
    time_t temp = time(NULL);
    struct tm *tick_time = localtime(&temp);
    strftime(text, sizeof(text), layer->Content, tick_time);
    //draw it
    graphics_draw_text(ctx, text, font(layer->FontSettings), layer->Rect, overflow(layer->FontSettings), alignment(layer->FontSettings), (GTextAttributes *)0);
  }

}