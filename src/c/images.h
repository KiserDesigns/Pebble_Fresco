#pragma once

//image data:
/**

typedef struct LayerInfo {
  GRect Rect; // bounds of the image
  uint32_t LayerSettings; //4-byte hash to request from phone for full-res data
  uint32_t ContentSettings; //4
  uint16_t Radius; //2
  uint8_t DynamicMask; //1
  GColor BackgroundColor; //1
  GColor ForegroundColor; //1
  uint8_t Type; //1
  uint8_t FontSettings; //1
  char Content[41]; //first 16 are the colors that each nibble represent
} LayerInfo;

**/

