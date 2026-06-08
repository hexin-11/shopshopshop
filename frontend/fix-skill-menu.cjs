const fs = require('fs');
const path = 'src/components/AgentDock.tsx';
let txt = fs.readFileSync(path, 'utf8');

// Inside AgentDock, add a global click listener for skillMenuOpen
txt = txt.replace(
  /const \[skillMenuOpen, setSkillMenuOpen\] = useState\(false\);/,
  `const [skillMenuOpen, setSkillMenuOpen] = useState(false);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.agent-skill-menu') && !target.closest('.agent-skill-button')) {
        setSkillMenuOpen(false);
      }
    };
    if (skillMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [skillMenuOpen]);`
);

// Inside VCInputBox, remove its flawed document.querySelector
txt = txt.replace(
  /const skillMenu = document\.querySelector\('\.agent-skill-menu'\);\s*const skillBtn = document\.querySelector\('\.agent-skill-button'\);\s*if \(skillMenuOpen[^}]+\}\s*\}/,
  ``
);

fs.writeFileSync(path, txt);
console.log('Fixed skillMenu interaction!');
