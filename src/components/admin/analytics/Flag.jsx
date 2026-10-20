import React, { useState } from 'react';
import { Globe } from 'lucide-react';

const Flag = ({ code }) => {
  const [failed, setFailed] = useState(false);
  const valid = typeof code === 'string' && /^[A-Za-z]{2}$/.test(code) && code.toUpperCase() !== 'XX';
  if (!valid || failed) {
    return <Globe className="an-flag-globe" size={15} aria-label={valid ? code : 'Unknown country'} />;
  }
  const c = code.toLowerCase();
  return (
    <img
      className="an-flag"
      src={`https://flagcdn.com/w40/${c}.png`}
      srcSet={`https://flagcdn.com/w80/${c}.png 2x`}
      width={20}
      height={15}
      alt={code.toUpperCase()}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
};

export default Flag;
