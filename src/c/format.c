#include <pebble.h>
#include "format.h"
#include "src/c/three_words.h"

int formattimewords(char* buffer, int length, const char *format, time_t time) {
    //char print_buf[1024];
    char *str = NULL;
    static char wordbuffer[10];
    char *s;

    for(str = buffer; *format; format++) {
        if(*format != '%') { // if the character is not '%' move to next character
            *str++ = *format; //copy this character into the buffer
            // printed++;
            continue;
        }
        ++format; // if there is '%', move to the next character
        strcpy(wordbuffer,"\0\0\0\0\0\0\0\0\0"); //this is where we will store the word
        s = wordbuffer;
  
        switch (*format) {
        case 'J':
            get_first_word(s, sizeof(wordbuffer), time);
            // printed++;
            while(*s) {
                *str++ = *s++;
            }
            break;
        case 'K':
            get_second_word(s, sizeof(wordbuffer), time);
            // printed++;
            while(*s) {
                *str++ = *s++;
            }
            break;
        case 'L':
            get_third_word(s, sizeof(wordbuffer), time);
            // printed++;
            while(*s) {
                *str++ = *s++;
            }
            break;
        case 'N':
            snprintf(s, sizeof(wordbuffer), "%d", localtime(&time)->tm_hour%24);
            // printed++;
            while(*s) {
                *str++ = *s++;
            }
            break;
        case 'o':
            snprintf(s, sizeof(wordbuffer), "%d", (localtime(&time)->tm_hour+11)%12+1);
            // printed++;
            while(*s) {
                *str++ = *s++;
            }
            break;
        case 'q':
            snprintf(s, sizeof(wordbuffer), "%s", clock_is_24h_style()?"%H":"%I");
            // printed++;
            while(*s) {
                *str++ = *s++;
            }
            break;
        case 'Q':
            snprintf(s, sizeof(wordbuffer), clock_is_24h_style()?"%02d":"%d", clock_is_24h_style()?localtime(&time)->tm_hour%24:(localtime(&time)->tm_hour+11)%12+1);
            // printed++;
            while(*s) {
                *str++ = *s++;
            }
            break;
        case 'f':
            snprintf(s, sizeof(wordbuffer), "%d", battery_state_service_peek().charge_percent);
            // printed++;
            while(*s) {
                *str++ = *s++;
            }
            break;
        case 'i':
            snprintf(s, sizeof(wordbuffer), "%ld", (long int)health_service_peek_current_value(HealthMetricHeartRateBPM));
            // printed++;
            while(*s) {
                *str++ = *s++;
            }
            break;
        case 'v':
            snprintf(s, sizeof(wordbuffer), "%ld", (long int)health_service_sum_today(HealthMetricStepCount));
            // printed++;
            while(*s) {
                *str++ = *s++;
            }
            break;

        default:
            *str++ = '%'; // if after '%' does not have valid identifier, print as usual
            if(*format) {
                *str++ = *format;
            }
        }
    }
    *str = '\0'; //terminate the output string

    return 0;
}