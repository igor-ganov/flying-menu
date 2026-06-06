import { type Option, some } from './option'

/**
 * Transform the value inside a present {@link Option}; pass an absent one
 * through. Curried, data-last for pipelines.
 *
 * @param f - Mapping from the contained value.
 * @returns A function from `Option<A>` to `Option<B>`.
 */
export const map =
  <A, B>(f: (a: A) => B) =>
  (option: Option<A>): Option<B> => {
    switch (option._tag) {
      case 'Some':
        return some(f(option.value))
      case 'None':
        return option
    }
  }
