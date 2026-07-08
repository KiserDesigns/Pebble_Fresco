#include <pebble.h>
#include "three_words.h"

void get_first_word(char* buffer, int length, time_t time){
  static char *words[] = {"half", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "quarter"};
  struct tm* now = localtime(&time);
  int min = now->tm_min;
  int hour = now->tm_hour;
  
  int index = -1;
  
  if (min == 5 || (min >= 10 && min <= 13) || min == 20){
    index = min;
  } else if (min == 30) {
    index = 0;
  } else if (min == 15 || min == 45) {
    index = 14;
  } else if (min == 50) {
    index = 10;
  } else if (min == 55) {
    index = 5;
  } else {
    index = hour % 12;
    if (index == 0) {
      index = 12;
    }
  }
  strcpy(buffer, words[index]);
}

void get_second_word(char* buffer, int length, time_t time){
  
}

void get_third_word(char* buffer, int length, time_t time){
  
}