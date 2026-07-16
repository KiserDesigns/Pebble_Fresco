#include <pebble.h>
#include "analog.h"

/**
typedef struct LayerInfo {
  GRect Rect; // bounds of the analog clock
  uint32_t LayerSettings; //4
  uint32_t ContentSettings; //4
  uint16_t Radius; // High byte, relative length of hour hand (0-255). Low byte, length of minute hand. Second hand length is min(Rect.size.w/h)
  uint8_t DynamicMask; //high 4 bits, minute thickness. low 4, hour hand thickness
  GColor BackgroundColor; //Hour Color
  GColor ForegroundColor; //Minute Color
  uint8_t Type; //1
  uint8_t FontSettings; //.argb of Seconds Color
  char Content[41]; //first 20 bytes: 10 points [x1,y1,x2,y2,...] for hour hand filled vector. second 20 bytes for minute hand
} LayerInfo;
**/


void draw_analog(GContext * ctx, LayerInfo * layer, struct tm * localtime){
  int diameter = (layer->Rect.size.h>layer->Rect.size.w?layer->Rect.size.w:layer->Rect.size.h);
  GPoint center = grect_center_point(&(layer->Rect));
  
  if (layer->LayerSettings&DRAW_HOUR){
    uint8_t hr_diameter = diameter * ((layer->Radius>>8)&0x0FF) / 255;
    GRect hr_rect = GRect(0,0,hr_diameter,hr_diameter);
    grect_align(&hr_rect, &(layer->Rect), GAlignCenter, false);
    int hr_angle = DEG_TO_TRIGANGLE((localtime->tm_hour%12)*60 + (localtime->tm_min))/2;
    GPoint hr_point = gpoint_from_polar(hr_rect, GOvalScaleModeFitCircle, hr_angle);
    graphics_context_set_stroke_color(ctx, layer->BackgroundColor);
    graphics_context_set_stroke_width(ctx, 1+2*(layer->DynamicMask&0x0F));
    graphics_draw_line(ctx, center, hr_point);
  }
  if (layer->LayerSettings&DRAW_MIN){
    uint8_t min_diameter = diameter * ((layer->Radius)&0x0FF) / 255;
    GRect min_rect = GRect(0,0,min_diameter,min_diameter);
    grect_align(&min_rect, &(layer->Rect), GAlignCenter, false);
    int min_angle;
    if (layer->LayerSettings&DRAW_SEC){
      min_angle = DEG_TO_TRIGANGLE(localtime->tm_min*6 + localtime->tm_sec/10);
    } else {
      min_angle = DEG_TO_TRIGANGLE(localtime->tm_min*6);
    }
    GPoint min_point = gpoint_from_polar(min_rect, GOvalScaleModeFitCircle, min_angle);
    graphics_context_set_stroke_color(ctx, layer->ForegroundColor);
    graphics_context_set_stroke_width(ctx, 1+2*((layer->DynamicMask>>4)&0x0F));
    graphics_draw_line(ctx, center, min_point);
  }
  if (layer->LayerSettings&DRAW_SEC){
    int sec_angle = DEG_TO_TRIGANGLE(localtime->tm_sec*6);
    GPoint sec_point = gpoint_from_polar(layer->Rect, GOvalScaleModeFitCircle, sec_angle);
    graphics_context_set_stroke_color(ctx, (GColor8){.argb=layer->FontSettings});
    graphics_context_set_stroke_width(ctx, 3); // ***************************** NEED TO ENCODE WIDTH
    graphics_draw_line(ctx, center, sec_point);
  }
}