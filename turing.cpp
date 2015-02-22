#include <SDL2/SDL.h>
#include <cmath>
#include <stdio.h>
#include <assert.h>

#ifndef M_PI
#define M_PI 3.14159265358979323846f
#endif

#ifdef __EMSCRIPTEN__
#include "emscripten/emscripten.h"
#endif

#ifdef main
#undef main
#endif

class TuringScale {
public:
  TuringScale(int act
private:
  int actRad;
  int inhRad;
  double smAmt;
  int act[];
  int inh[];
};

void update() {
}

void setPx(SDL_Surface *screen, int x, int y, int r, int g, int b) {
  unsigned int *ptr = (unsigned int*)screen->pixels;
  int lineoffset = y * (screen->pitch / 4);
  ptr[lineoffset + x] = SDL_MapRGB(screen->format, r, g, b);
}

void xorPattern(SDL_Surface *surf) {
  for (int y = 0; y < surf->h; y++) {
    for (int x = 0; x < surf->w; x++) {
      if (x > 30) {
        setPx(surf, x, y, 255, 0, 0);
      } else {
        setPx(surf, x, y, 0, 0, 255);
      }
    }
  }
}

int main(int argc, char** argv) {
  if (SDL_Init(SDL_INIT_VIDEO) != 0) {
    printf("Unable to initialize SDL: %s\n", SDL_GetError());
    return 1;
  }

  SDL_Window *window = SDL_CreateWindow(
    "sdl2_swsurface",
    SDL_WINDOWPOS_UNDEFINED,
    SDL_WINDOWPOS_UNDEFINED,
    640, 480,
    0
  );
  if (window == NULL) {
    printf("Could not create window: %s\n", SDL_GetError());
    return 1;
  }

  SDL_Surface *screen = SDL_GetWindowSurface(window);
  if (screen == NULL || screen->pixels == NULL) {
    printf("Screen pixels are null: %s\n", SDL_GetError());
    return 1;
  }

  printf("SDL get error: %s\n", SDL_GetError());

  xorPattern(screen);
  SDL_UpdateWindowSurface(window);
#ifdef __EMSCRIPTEN__
  emscripten_set_main_loop(update, 60, 0);
#else
  int quit = false;
  SDL_Event event;
  while (!quit) {
    SDL_Delay(200);
    update();
    while(SDL_PollEvent(&event)) {
      if (event.type == SDL_QUIT) {
        SDL_DestroyWindow(window);
        SDL_Quit();
        quit = true;
      }
    }
  }
#endif

  return 0;
}
