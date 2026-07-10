#include <pebble.h>
#include "three_words.h"

void get_first_word(char* buffer, int length, time_t time){
  static char *words[] = {"half", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "quarter", "twenty"};
  struct tm* now = localtime(&time);
  int min = now->tm_min;
  int hour = now->tm_hour;
  
  int index = -1;
  
  if (min == 5 || (min >= 10 && min <= 13)){
    index = min;
  } else if (min == 30) {
    index = 0;
  } else if (min == 15 || min == 45) {
    index = 14;
  } else if (min == 40 || min == 20) {
    index = 15;
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
  static char *words[] = {"o'", "oh", "twenty", "thirty", "fourty", "fifty", "six-", "seven-", "eight-", "nine-", "past", "till", "four-"};
  struct tm* now = localtime(&time);
  int min = now->tm_min;
  
  int index = -1;
  
  if (min == 5 || (min >= 10 && min <= 13) || min == 15 || min == 20 || min == 30){
    index = 10;
  } else if (min >= 1 && min <= 9) {
    index = 1;
  } else if (min == 0) {
    index = 0;
  } else if (min >= 14 && min <= 19) {
    if (min == 14) {
      index = 12;
    } else {
      index = min - 10;
    }
  } else if (min == 40 || min == 45 || min == 50 || min == 55) {
    index = 11;
  } else {
    index = min / 10;
  }
  strcpy(buffer, words[index]);
}

void get_third_word(char* buffer, int length, time_t time){
  static char *words[] = {"clock", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "teen", "noon", "midnight"};
  struct tm* now = localtime(&time);
  int min = now->tm_min;
  int hour = now->tm_hour;
  
  int index = -1;
  
  if (min == 5 || (min >= 10 && min <= 13) || min == 15 || min == 20 || min == 30){
    if (hour == 0) {
      index = 15;
    } else if (hour == 12) {
      index = 14;
    } else {
      index = hour % 12;
    }
  } else if (min == 0) {
    index = 0;
  } else if (min >= 14 && min <= 19) {
    index = 13;
  } else if (min == 40 || min == 45 || min == 50 || min == 55) {
    hour = hour + 1;
    if (hour == 24) {
      index = 15;
    } else if (hour == 12) {
      index = 14;
    } else {
      index = hour % 12;
    }
  } else {
    index = min % 10;
  }
  strcpy(buffer, words[index]);
}
