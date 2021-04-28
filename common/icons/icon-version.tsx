import * as React from 'react';
import Svg, { Circle, Path, SvgProps } from 'react-native-svg';

export const IconVersion = (props: SvgProps) => {
  return (
    <Svg width={64} height={64} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <Circle cx={32} cy={32} r={32} fill="#F6F6F6" />
      <Circle cx={31.5} cy={32.5} r={10} fill="#FFE493" />
      <Path
        d="M29.629 27.554a.506.506 0 01.195.972 4.306 4.306 0 00-.826 7.487 3.814 3.814 0 00.557.338c.267.135.547.24.836.316l-.709-.968a.506.506 0 01.816-.598l1.41 1.924.002.003a.479.479 0 01.04.07.56.56 0 01.032.08c.003.012.008.023.01.034.003.012.005.032.007.048a.485.485 0 01.006.054v.008c0 .011-.003.022-.004.033a.532.532 0 01-.006.057c-.002.014-.006.026-.01.04a.565.565 0 01-.017.057l-.015.032a.493.493 0 01-.031.058l-.018.023a.466.466 0 01-.044.054c-.006.007-.013.012-.02.018a.487.487 0 01-.043.038l-1.922 1.408a.506.506 0 01-.598-.816l.905-.665a5.285 5.285 0 01-1.085-.407 4.792 4.792 0 01-.694-.422 5.318 5.318 0 011.03-9.238.508.508 0 01.196-.038zm3.937 9.853a.507.507 0 01-.719-.463.506.506 0 01.33-.47 4.308 4.308 0 00.826-7.487 3.794 3.794 0 00-.557-.338 4.257 4.257 0 00-.836-.316l.71.968a.506.506 0 11-.818.598l-1.41-1.923-.002-.003a.473.473 0 01-.04-.07l-.011-.019a.539.539 0 01-.021-.061c-.004-.012-.008-.023-.01-.035-.003-.011-.005-.031-.007-.047a.51.51 0 01-.006-.054v-.008l.003-.033a.558.558 0 01.007-.058c.002-.013.006-.026.01-.039a.56.56 0 01.017-.058l.015-.031a.79.79 0 01.031-.058c.005-.009.012-.016.017-.024a.492.492 0 01.045-.053c.006-.007.013-.012.02-.018a.496.496 0 01.042-.039l1.924-1.41a.506.506 0 01.598.817l-.906.665a5.28 5.28 0 011.778.83 5.32 5.32 0 01-1.03 9.237z"
        fill="#000"
      />
      <Path
        d="M41.273 49.627H21.727a2.243 2.243 0 01-2.24-2.24V17.613a2.242 2.242 0 012.24-2.24h19.546a2.243 2.243 0 012.24 2.24v29.774a2.242 2.242 0 01-2.24 2.24zm-4.748-1.012l-.718-1.493h-8.614l-.718 1.493h10.05zM42.5 17.613a1.23 1.23 0 00-1.228-1.228H21.727a1.23 1.23 0 00-1.228 1.228v29.774a1.23 1.23 0 001.229 1.228h3.625l1.066-2.218a.505.505 0 01.456-.287h9.25a.505.505 0 01.456.287l1.067 2.218h3.625a1.23 1.23 0 001.228-1.228V17.613z"
        fill="#000"
      />
      <Path
        d="M34.607 20.191h-6.215a.506.506 0 010-1.012h6.215a.506.506 0 010 1.012z"
        fill="#000"
      />
    </Svg>
  );
};
