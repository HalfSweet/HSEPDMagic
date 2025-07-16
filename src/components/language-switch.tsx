import { useTranslation } from 'react-i18next';
import { Button } from '@heroui/button';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/dropdown';

export function LanguageSwitch() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = i18n.language === 'zh' ? '简体中文' : 'English';

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="light" size="sm">
          {currentLanguage}
        </Button>
      </DropdownTrigger>
      <DropdownMenu 
        aria-label="Language selection"
        onAction={(key: any) => changeLanguage(key as string)}
      >
        <DropdownItem key="zh">简体中文</DropdownItem>
        <DropdownItem key="en">English</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
