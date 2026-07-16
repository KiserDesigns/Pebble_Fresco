#include <pebble.h>
#include "analog.h"

/**
typedef struct LayerInfo {
  GRect Rect; // origin is center of clock. size.w is length of minute hand. size.h is length of hour hand
  uint32_t LayerSettings; //4
  uint32_t ContentSettings; //8 bits tick radius. Major Tick: 6b color, 3b length, 3b thickness. Minor Tick 6-3-3
  uint16_t Radius; //high 4 bits, thickness of second hand. middle 6 bits, minute hand thickness. Low 6, hour thickness
  uint8_t DynamicMask; //length of second hand
  GColor BackgroundColor; //Hour Color
  GColor ForegroundColor; //Minute Color
  uint8_t Type; //1
  uint8_t FontSettings; //.argb of Seconds Color
  char Content[41]; //first 20 bytes: points for hour hand filled vector. second 20 bytes for minute hand.
} LayerInfo;        //first byte of the 20 determines (bit 1 is 0 for filled or 1 for stroke) (bit 2 set if fill, bit 2 set if stroke and next 6 bits are color info)
                    //then the lower 6 bits are color info if bit 2 is set, and size (stroke width) info is bit 2 is not set.
                    //next byte (and subsequent) are 3 bits for "x" [1,7] -> [-3,3] and 5 bits for "y" [0-30] -> [-5,25], assuming hand pointing up and pos y is upwards
                    //if the byte 0xFF occurs, then another string of bytes can describe another stroke or fill path.
**/

// x' = x*cos(t) - y*sin(t)
// y' = x*sin(t) + y*cos(t)

uint32_t build_tick_settings(uint8_t radius, GColor major_color, uint8_t major_length, uint8_t major_thickness,\
                           GColor minor_color, uint8_t minor_length, uint8_t minor_thickness){
  return ((radius&0x0FF)<<24) | ((major_color.argb&0x03F)<<18) | ((major_length&0x07)<<15) | ((major_thickness&0x07)<<12)\
                              | ((minor_color.argb&0x03F)<<6) | ((minor_length&0x07)<<3) | ((minor_thickness&0x07)<<0);
}

void draw_analog(GContext * ctx, LayerInfo * layer, struct tm * localtime){
  GPoint center = layer->Rect.origin;
  if (layer->LayerSettings&(DRAW_MINOR_TICK|DRAW_MAJOR_TICK)){
    uint8_t diameter = ((layer->ContentSettings)>>24)&0x0FF;
    GColor maj_color = (GColor8){.argb=(((layer->ContentSettings)>>18)&0x03F)|0xC0};
    uint8_t maj_dia = diameter - (2*(((layer->ContentSettings)>>15)&0x07));
    uint8_t maj_thick = 1+ (2*(((layer->ContentSettings)>>12)&0x07));
    GColor min_color = (GColor8){.argb=(((layer->ContentSettings)>>6)&0x03F)|0xC0};
    uint8_t min_dia = diameter - (2*(((layer->ContentSettings)>>3)&0x07));
    uint8_t min_thick = 1+ (2*(((layer->ContentSettings)>>0)&0x07));
    GRect rect = GRect(center.x-diameter,center.y-diameter,2*diameter+1,2*diameter+1); 
    GRect maj_rect = GRect(center.x-maj_dia,center.y-maj_dia,2*maj_dia+1,2*maj_dia+1);
    GRect min_rect = GRect(center.x-min_dia,center.y-min_dia,2*min_dia+1,2*min_dia+1);
    for (int angle = 0; angle < 359; angle = angle + 6){
      GPoint outer = gpoint_from_polar(rect, GOvalScaleModeFitCircle, DEG_TO_TRIGANGLE(angle));
      GPoint major = gpoint_from_polar(maj_rect, GOvalScaleModeFitCircle, DEG_TO_TRIGANGLE(angle));
      GPoint minor = gpoint_from_polar(min_rect, GOvalScaleModeFitCircle, DEG_TO_TRIGANGLE(angle));
      if (layer->LayerSettings&DRAW_MAJOR_TICK && (angle%10)==0){
        graphics_context_set_stroke_color(ctx, maj_color);
        graphics_context_set_stroke_width(ctx, maj_thick);
        graphics_draw_line(ctx, outer, major);
      } else if (layer->LayerSettings&DRAW_MINOR_TICK){
        graphics_context_set_stroke_color(ctx, min_color);
        graphics_context_set_stroke_width(ctx, min_thick);
        graphics_draw_line(ctx, outer, minor);
      }
    }
  }
  if (layer->LayerSettings&DRAW_HOUR){
    uint16_t diameter = layer->Rect.size.h;
    GRect rect = GRect(center.x-diameter,center.y-diameter,2*diameter+1,2*diameter+1);
    int angle = DEG_TO_TRIGANGLE((localtime->tm_hour%12)*60 + (localtime->tm_min))/2;
    GPoint point = gpoint_from_polar(rect, GOvalScaleModeFitCircle, angle);
    graphics_context_set_stroke_color(ctx, layer->BackgroundColor);
    graphics_context_set_stroke_width(ctx, 1+2*(layer->Radius&0x03F));
    
    graphics_draw_line(ctx, center, point);
  }
  if (layer->LayerSettings&DRAW_MIN){
    uint16_t diameter = layer->Rect.size.w;
    GRect rect = GRect(center.x-diameter,center.y-diameter,2*diameter+1,2*diameter+1);
    int angle;
    if (layer->LayerSettings&DRAW_SEC){
      angle = DEG_TO_TRIGANGLE(localtime->tm_min*6 + localtime->tm_sec/10);
    } else {
      angle = DEG_TO_TRIGANGLE(localtime->tm_min*6);
    }
    GPoint point = gpoint_from_polar(rect, GOvalScaleModeFitCircle, angle);
    graphics_context_set_stroke_color(ctx, layer->ForegroundColor);
    graphics_context_set_stroke_width(ctx, 1+2*((layer->Radius>>6)&0x03F));
    
    graphics_draw_line(ctx, center, point);
  }
  if (layer->LayerSettings&DRAW_SEC){
    uint16_t diameter = layer->DynamicMask;
    GRect rect = GRect(center.x-diameter,center.y-diameter,2*diameter+1,2*diameter+1);
    int angle = DEG_TO_TRIGANGLE(localtime->tm_sec*6);
    GPoint point = gpoint_from_polar(rect, GOvalScaleModeFitCircle, angle);
    graphics_context_set_stroke_color(ctx, (GColor8){.argb=((layer->FontSettings)&0x3F)|0xC0});
    graphics_context_set_stroke_width(ctx, 1+2*((layer->Radius>>12)&0x0F)); // ***************************** NEED TO ENCODE WIDTH
    graphics_draw_line(ctx, center, point);
  }
}