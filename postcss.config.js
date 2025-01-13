import pxtorem from 'postcss-pxtorem';
import sortMediaQueries from 'postcss-sort-media-queries';
import autoprefixer from 'autoprefixer';

export default {
  plugins: [
    sortMediaQueries({
      sort: 'mobile-first', // Используется сортировка "mobile-first"
    }),
    autoprefixer(),
    pxtorem({
      rootValue: 16,
      propList: ['*'],
      replace: true,
      minPixelValue: 0,
    }),
  ],
};
