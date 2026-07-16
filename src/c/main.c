#include <pebble.h>
#include "src/c/three_words.h"
#include "src/c/layerinfo.h"
#include "src/c/format.h"
#include "src/c/layer.h"
#include "src/c/analog.h"

// Persistent storage key
#define SETTINGS_KEY 1

// Max number of layers
#define NUM_LAYERS 25

#define LAYER_KEY_ITERATION 1

// Define our settings struct
typedef struct PageSettings {
  GColor BackgroundColor;
  GColor ForegroundColor;
  bool TemperatureUnit;
} PageSettings;

// An instance of the struct
static PageSettings settings;

static LayerInfo layers[NUM_LAYERS];

static Window *s_main_window;

static int s_battery_level;
static bool s_bt_connected;
static char temperature_buffer[8];
static char conditions_buffer[32];
static bool s_js_ready;

// Root layer (will do all drawing here)
static Layer *s_window_layer;

// Set default settings
static void prv_default_settings() {
  settings.BackgroundColor = GColorBlack;
  settings.ForegroundColor = GColorWhite;
  settings.TemperatureUnit = false;
  
  layers[0].LayerSettings = DRAW_OUTLINE | LAYER_ENABLED;
  layers[0].ContentSettings = 0;
  layers[0].Radius = PBL_IF_RECT_ELSE(8,24);
  layers[0].Rect = GRect(PBL_IF_RECT_ELSE(2,10),PBL_DISPLAY_HEIGHT-PBL_IF_RECT_ELSE(50,PBL_DISPLAY_HEIGHT/2),PBL_DISPLAY_WIDTH-PBL_IF_RECT_ELSE(4,20),48);
  layers[0].DynamicMask = 0;
  layers[0].BackgroundColor = GColorBlack;
  layers[0].ForegroundColor = GColorWhite;
  layers[0].Type = TYPE_TEXT;
  layers[0].FontSettings = build_font_settings(clock_is_24h_style()?20:18, PBL_IF_RECT_ELSE(GTextAlignmentRight,GTextAlignmentCenter), GTextOverflowModeWordWrap);
  strcpy(layers[0].Content, clock_is_24h_style()?" %Q:%M ":" %Q:%M %p ");
  
  layers[1].LayerSettings = LAYER_ENABLED;
  layers[1].ContentSettings = 0;
  layers[1].Radius = 0;
  layers[1].Rect = GRect(PBL_IF_RECT_ELSE(10,25),PBL_DISPLAY_HEIGHT-PBL_IF_RECT_ELSE(50,PBL_DISPLAY_HEIGHT/2)-(PBL_DISPLAY_WIDTH < 200 ? 80 : 55),PBL_DISPLAY_WIDTH-PBL_IF_RECT_ELSE(20,50),50);
  layers[1].DynamicMask = 0;
  layers[1].BackgroundColor = GColorBlack;
  layers[1].ForegroundColor = GColorWhite;
  layers[1].Type = TYPE_TEXT;
  layers[1].FontSettings = build_font_settings(6, PBL_IF_RECT_ELSE(GTextAlignmentLeft,GTextAlignmentCenter), GTextOverflowModeWordWrap);
  strcpy(layers[1].Content, "Select a Watchface in Fresco Settings");
  //strcpy(layers[1].Content, "%J %K %L");
  
  layers[2].LayerSettings = LAYER_ENABLED | DITHER_UD;
  layers[2].ContentSettings = 0;
  layers[2].Radius = 0;
  layers[2].Rect = GRect(0,0,PBL_DISPLAY_WIDTH,20);
  layers[2].DynamicMask = 0;
  layers[2].BackgroundColor = GColorWhite;
  layers[2].ForegroundColor = GColorBlack;
  layers[2].Type = TYPE_RECT;
  layers[2].FontSettings = 0;
  strcpy(layers[2].Content, "");
  
  layers[3].LayerSettings = LAYER_ENABLED | DRAW_MIN | DRAW_HOUR | DRAW_SEC | DRAW_MAJOR_TICK | DRAW_MINOR_TICK;
  layers[3].ContentSettings = build_tick_settings(PBL_DISPLAY_WIDTH/2 - 10,PBL_IF_COLOR_ELSE(GColorBlue,GColorWhite),0,5,GColorWhite,0,1);
  layers[3].Radius = (1<<12) | (2<<6) | 3;
  layers[3].Rect = GRect(PBL_DISPLAY_WIDTH/2,PBL_DISPLAY_HEIGHT/2,PBL_DISPLAY_WIDTH/2 - 25,PBL_DISPLAY_WIDTH/2 - 40);
  layers[3].DynamicMask = PBL_DISPLAY_WIDTH/2 - 15;
  layers[3].BackgroundColor = PBL_IF_COLOR_ELSE(GColorRed,GColorWhite);
  layers[3].ForegroundColor = GColorWhite;
  layers[3].Type = TYPE_ANALOG;
  layers[3].FontSettings = PBL_IF_COLOR_ELSE(GColorMagenta,GColorWhite).argb;
  strcpy(layers[2].Content, "");
  
  for (int i=4; i<NUM_LAYERS; i++) {
    //disable the rest
    layers[i].LayerSettings&=!LAYER_ENABLED;
  }
}

// Save settings to persistent storage
static void prv_save_settings() {
  persist_write_data(SETTINGS_KEY, &settings, sizeof(settings));
}

// Save a single layer to persistent storage
static void prv_save_layer(int i){
  persist_write_data(LAYER_KEY_ITERATION*NUM_LAYERS+i,&layers[i], sizeof(LayerInfo));
}

// Read settings and layers from persistent storage
static void prv_load_settings() {
  // Set defaults first
  prv_default_settings();
  // Then override with any saved values
  persist_read_data(SETTINGS_KEY, &settings, sizeof(settings));
  
  for (int i=0; i<NUM_LAYERS; i++){
    persist_read_data(LAYER_KEY_ITERATION*NUM_LAYERS+i,&layers[i], sizeof(LayerInfo));
  }
}

// Apply settings to UI elements
static void prv_update_display() {
  layer_mark_dirty(s_window_layer);
}

static void tick_handler(struct tm *tick_time, TimeUnits units_changed) {
  
  layer_mark_dirty(s_window_layer);

  // Get weather update every 30 minutes
  if ((tick_time->tm_min % 30 == 0)&& (s_js_ready==true)) {
    DictionaryIterator *iter;
    app_message_outbox_begin(&iter);
    dict_write_uint8(iter, MESSAGE_KEY_REQUEST_WEATHER, 1);
    app_message_outbox_send();
  }
  
}

static void battery_callback(BatteryChargeState state) {
  s_battery_level = state.charge_percent;
  layer_mark_dirty(s_window_layer);
}

static void bluetooth_callback(bool connected) {
  s_bt_connected = connected;
  layer_mark_dirty(s_window_layer);
}

static void canvas_update_proc(Layer *layer, GContext *ctx) {
  GRect bounds = layer_get_bounds(layer);
  graphics_context_set_fill_color(ctx, settings.BackgroundColor);
  graphics_fill_rect(ctx, bounds, 1, GCornerNone);
  
  
  time_t temp = time(NULL);
  struct tm *tick_time = localtime(&temp);
  static char s_date_buffer[16];
  strftime(s_date_buffer, sizeof(s_date_buffer), "%a %b %d", tick_time);
  
  
  static char weather_layer_buffer[42];
  snprintf(weather_layer_buffer, sizeof(weather_layer_buffer), "%s %s", temperature_buffer, conditions_buffer);  
  
  
  for (int i=0; i<NUM_LAYERS; i++){
    if (layers[i].LayerSettings&LAYER_ENABLED){
      draw_layer(ctx, &layers[i], temp); 
    }
  }       
}


// AppMessage received handler
static void inbox_received_callback(DictionaryIterator *iterator, void *context) {
  // Check for weather data
  Tuple *temp_tuple = dict_find(iterator, MESSAGE_KEY_TEMPERATURE);
  Tuple *conditions_tuple = dict_find(iterator, MESSAGE_KEY_CONDITIONS);
  
  Tuple *ready_tuple = dict_find(iterator, MESSAGE_KEY_JSReady);
  if(ready_tuple) {
    // PebbleKit JS is ready! Safe to send messages
    s_js_ready = true;
  }


  if (temp_tuple && conditions_tuple) {

    int temp_value = (int)temp_tuple->value->int32;

    // Convert to Fahrenheit if setting is enabled
    if (settings.TemperatureUnit) {
      temp_value = (temp_value * 9 / 5) + 32;
      snprintf(temperature_buffer, sizeof(temperature_buffer), "%d°F", temp_value);
    } else {
      snprintf(temperature_buffer, sizeof(temperature_buffer), "%d°C", temp_value);
    }

    snprintf(conditions_buffer, sizeof(conditions_buffer), "%s", conditions_tuple->value->cstring);
    //text_layer_set_text(s_weather_layer, weather_layer_buffer);
  }

  // Check for Clay settings data
  Tuple *bg_color_t = dict_find(iterator, MESSAGE_KEY_MainBGColor);
  if (bg_color_t) {
    settings.BackgroundColor = GColorFromHEX(bg_color_t->value->int32);
  }

  Tuple *text_color_t = dict_find(iterator, MESSAGE_KEY_MainFGColor);
  if (text_color_t) {
    settings.ForegroundColor = GColorFromHEX(text_color_t->value->int32);
  }

  Tuple *temp_unit_t = dict_find(iterator, MESSAGE_KEY_TemperatureUnit);
  if (temp_unit_t) {
    settings.TemperatureUnit = temp_unit_t->value->int32 == 1;
  }

  // Save and apply if any settings were changed
  if (bg_color_t || text_color_t || temp_unit_t) {
    prv_save_settings();
    prv_update_display();

    // Refetch weather if the temperature unit changed so the display updates
    if (temp_unit_t) {
      DictionaryIterator *iter;
      app_message_outbox_begin(&iter);
      dict_write_uint8(iter, MESSAGE_KEY_REQUEST_WEATHER, 1);
      app_message_outbox_send();
    }
  }
}

static void inbox_dropped_callback(AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_ERROR, "Message dropped!");
}

static void outbox_failed_callback(DictionaryIterator *iterator, AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_ERROR, "Outbox send failed!");
}

static void outbox_sent_callback(DictionaryIterator *iterator, void *context) {
  APP_LOG(APP_LOG_LEVEL_INFO, "Outbox send success!");
}

static void main_window_load(Window *window) {
  s_window_layer = window_get_root_layer(window);
  
  //GRect bounds = layer_get_bounds(s_window_layer);
  
  layer_set_update_proc(s_window_layer, canvas_update_proc);

  // Load custom fonts
  //s_time_font = fonts_load_custom_font(resource_get_handle(RESOURCE_ID_FONT_JERSEY_56));
  //s_date_font = fonts_load_custom_font(resource_get_handle(RESOURCE_ID_FONT_JERSEY_24));


  // Apply saved settings
  prv_update_display();

}

static void main_window_unload(Window *window) {
  //fonts_unload_custom_font(s_time_font);
  //fonts_unload_custom_font(s_date_font);
}

static void init() {
  // Load settings before creating UI
  prv_load_settings();

  s_main_window = window_create();
  window_set_background_color(s_main_window, settings.BackgroundColor);
  window_set_window_handlers(s_main_window, (WindowHandlers) {
    .load = main_window_load,
    .unload = main_window_unload
  });
  window_stack_push(s_main_window, true);

  tick_timer_service_subscribe(SECOND_UNIT, tick_handler);

  battery_state_service_subscribe(battery_callback);
  battery_callback(battery_state_service_peek());

  connection_service_subscribe((ConnectionHandlers) {
    .pebble_app_connection_handler = bluetooth_callback
  });

  // Register AppMessage callbacks
  app_message_register_inbox_received(inbox_received_callback);
  app_message_register_inbox_dropped(inbox_dropped_callback);
  app_message_register_outbox_failed(outbox_failed_callback);
  app_message_register_outbox_sent(outbox_sent_callback);

  // Open AppMessage
  app_message_open(app_message_inbox_size_maximum(), app_message_outbox_size_maximum());
}

static void deinit() {
  window_destroy(s_main_window);
}

int main(void) {
  init();
  app_event_loop();
  deinit();
}
