"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface AddressSearchProps {
  onSelect: (address: string, zonecode: string) => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    daum: any;
  }
}

export function AddressSearch({ onSelect, disabled = false }: AddressSearchProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const loadDaumPostcodeScript = () => {
    return new Promise<void>((resolve) => {
      if (window.daum && window.daum.Postcode) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.async = true;
      script.onload = () => {
        setIsScriptLoaded(true);
        resolve();
      };
      document.head.appendChild(script);
    });
  };

  const handleClick = async () => {
    await loadDaumPostcodeScript();

    new window.daum.Postcode({
      oncomplete: function(data: any) {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
          if (data.bname !== '') {
            extraAddress += data.bname;
          }
          if (data.buildingName !== '') {
            extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
          }
          fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
        }

        onSelect(fullAddress, data.zonecode);
      },
      width: '100%',
      height: '100%',
    }).open();
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={disabled}
      className="w-full"
    >
      <Search className="mr-2 h-4 w-4" />
      주소 검색
    </Button>
  );
}
