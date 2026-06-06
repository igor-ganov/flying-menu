import type { Option } from './option'

/**
 * Chain an {@link Option}-returning step onto a present value; pass an absent
 * one through. Curried, data-last for pipelines.
 *
 * @param f - Step producing the next `Option`.
 * @returns A function from `Option<A>` to `Option<B>`.
 */
export const flatMap =
  <A, B>(f: (a: A) => Option<B>) =>
  (option: Option<A>): Option<B> => {
    switch (option._tag) {
      case 'Some':
        return f(option.value)
      case 'None':
        return option
    }
  }
