// Dictionaries for premium Hinglish transliteration

// Common English loanwords written in Devanagari script ➔ proper English spelling
const LOANWORDS_MAP = {
  'लक्जरी': 'luxury',
  'लग्जरी': 'luxury',
  'लगजरी': 'luxury',
  'फ्लोर': 'floor',
  'फ़्लोर': 'floor',
  'इंस्टॉल': 'install',
  'इन्स्टॉल': 'install',
  'इंस्टाल': 'install',
  'सीमलेस': 'seamless',
  'सीम्लेस': 'seamless',
  'सीम लेस': 'seamless',
  'मैटेलिक': 'metallic',
  'मेटालिक': 'metallic',
  'मेतालिक': 'metallic',
  'मेतलिक': 'metallic',
  'एपॉक्सी': 'epoxy',
  'इपॉक्सी': 'epoxy',
  'एपोक्सी': 'epoxy',
  'अपोक्सी': 'epoxy',
  'कौंक्रीट': 'concrete',
  'कंक्रीट': 'concrete',
  'कोंक्रीट': 'concrete',
  'कुंक्रीट': 'concrete',
  'पैट्ट': 'prep',
  'पैच': 'patch',
  'पाच्वर': 'patchwork',
  'वग': 'work',
  'अपलाइ': 'apply',
  'अप्लाई': 'apply',
  'अपलाई': 'apply',
  'सालिट': 'solid',
  'सोलीट': 'solid',
  'सोलिट': 'solid',
  'कोट': 'coat',
  'बेस': 'base',
  'बेस्कोट': 'basecoat',
  'मस्वूथ': 'strong',
  'मजबूत': 'strong',
  'मस्बूद': 'strong',
  'प्राइमरी': 'primary',
  'प्रामरी': 'primary',
  'दीप': 'deep',
  'सिल्वर': 'silver',
  'स्पेस': 'space',
  'लूक': 'look',
  'प्रीमियम': 'premium',
  'सता': 'surface',
  'सताः': 'surface',
  'सतह': 'surface',
  'चमक्डार': 'shiny',
  'चमकदार': 'shiny',
  'वाट्साप': 'whatsapp',
  'वाट्सएप': 'whatsapp',
  'वोत्साप': 'whatsapp',
  'कोटेशन': 'quotation',
  'वीडियो': 'video',
  'विडियो': 'video',
  'ऑडियो': 'audio',
  'ऑडिओ': 'audio',
  'कंप्यूटर': 'computer',
  'कम्प्यूटर': 'computer',
  'मोबाइल': 'mobile',
  'स्क्रीन': 'screen',
  'कैप्शन': 'caption',
  'कैप्शंस': 'captions',
  'सब्सक्राइब': 'subscribe',
  'चैनल': 'channel',
  'डिजाइन': 'design',
  'डिज़ाइन': 'design',
  'मेटल': 'metal',
  'प्रोसेस': 'process',
  'सिस्टम': 'system',
  'प्रोग्राम': 'program',
  'लाइट': 'light',
  'कलर': 'color',
  'कलर्स': 'colors',
  'ब्लैक': 'black',
  'वाइट': 'white',
  'व्हाइट': 'white',
  'येलो': 'yellow',
  'ग्रीन': 'green',
  'ब्लू': 'blue',
  'रेड': 'red',
  'इंटरनेट': 'internet',
  'शेयर': 'share',
  'लाइक': 'like',
  'कमेंट': 'comment',
  'सॉफ्टवेयर': 'software',
  'हार्डवेयर': 'hardware',
  'एप्लिकेशन': 'application',
  'ऐप': 'app',
  'एप': 'app',
  'वेबसाइट': 'website',
  'कैमरा': 'camera',
  'फोटो': 'photo',
  'पिक्चर': 'picture',
  'म्यूजिक': 'music',
  'फिल्म': 'film',
  'मूवी': 'movie',
  'ऑफिस': 'office',
  'बिज़नेस': 'business',
  'बिजनेस': 'business',
  'मार्केट': 'market',
  'प्रोडक्ट': 'product',
  'सर्विस': 'service',
  'क्वालिटी': 'quality',
  'कस्टमर': 'customer',
  'सपोर्ट': 'support',
  'टीम': 'team',
  'ग्रुप': 'group',
  'क्लास': 'class',
  'स्टूडेंट': 'student',
  'टीचर': 'teacher',
  'स्कूल': 'school',
  'कॉलेज': 'college',
  'यूनिवर्सिटीज': 'universities',
  'यूनिवर्सिटी': 'university',
  'फाइल': 'file',
  'डेटा': 'data',
  'डाटा': 'data',
  'नेटवर्क': 'network',
  'सर्वर': 'server',
  'डेटाबेस': 'database',
  'सिक्योरिटी': 'security',
  'पासवर्ड': 'password',
  'ईमेल': 'email',
  'मैसेज': 'message',
  'कॉल': 'call',
  'फोन': 'phone'
};

// Common Hindi grammar/connective words ➔ natural, clean Hinglish spellings (not rigid rules)
const COMMON_HINDI_MAP = {
  'अपने': 'apne',
  'अपना': 'apna',
  'अपनी': 'apni',
  'हम': 'hum',
  'लिए': 'liye',
  'चाहते': 'chahte',
  'चाहता': 'chahta',
  'चाहती': 'chahti',
  'कर': 'kar',
  'रहे': 'rahe',
  'रहा': 'raha',
  'रही': 'rahi',
  'हैं': 'hain',
  'है': 'hai',
  'था': 'tha',
  'थी': 'thi',
  'थे': 'the',
  'हो': 'ho',
  'करते': 'karte',
  'करता': 'karta',
  'करती': 'karti',
  'आज': 'aaj',
  'आप': 'aap',
  'घर': 'ghar',
  'के': 'ke',
  'एक': 'ek',
  'ऐसा': 'aisa',
  'हैलो': 'hello',
  'बात': 'baat',
  'करेंगे': 'karenge',
  'करूँगा': 'karunga',
  'करूंगी': 'karungi',
  'करते': 'karte',
  'नमस्ते': 'namaste',
  'दोस्तों': 'dosto',
  'चले': 'chale',
  'चला': 'chala',
  'सालों-साल': 'saalo-saal',
  'सालो-साल': 'saalo-saal',
  'साल': 'saal',
  'तो': 'to',
  'जो': 'jo',
  'इसे': 'ise',
  'देखिए': 'dekhiye',
  'देखिये': 'dekhiye',
  'देखा': 'dekha',
  'के': 'ke',
  'में': 'mein',
  'पर': 'par',
  'से': 'se',
  'का': 'ka',
  'की': 'ki',
  'को': 'ko',
  'ने': 'ne',
  'भी': 'bhi',
  'और': 'aur',
  'था': 'tha',
  'नहीं': 'nahi',
  'नही': 'nahi',
  'क्या': 'kya',
  'क्यों': 'kyun',
  'कैसे': 'kaise',
  'कब': 'kab',
  'कहाँ': 'kahan',
  'कहा': 'kaha',
  'कुछ': 'kuch',
  'बहुत': 'bohot',
  'बहूंत': 'bohot',
  'सब': 'sab',
  'कोई': 'koi',
  'सता': 'satah',
  'सतह': 'satah',
  'मस्बूद': 'mazboot',
  'मजबूत': 'mazboot',
  'नीव': 'neev',
  'नींव': 'neev',
  'चमक्डार': 'chamakdar',
  'चमकदार': 'chamakdar',
  'पहले': 'pehle',
  'सबसे': 'sabse'
};

/**
 * Phonetically transliterates Devanagari characters as fallback.
 */
function ruleBasedTransliterate(word) {
  const VOWELS = {
    'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
    'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
    'अं': 'an', 'अँ': 'an', 'अः': 'ah'
  };

  const VOWEL_SIGNS = {
    'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo',
    'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
    'ं': 'n', 'ँ': 'n', 'ः': 'h'
  };

  const CONSONANTS = {
    'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
    'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
    'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
    'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
    'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
    'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh',
    'ष': 'sh', 'स': 's', 'ह': 'h', 'क्ष': 'ksh', 'त्र': 'tr', 'ज्ञ': 'gy'
  };

  const NUKTA_CONSONANTS = {
    'क़': 'q', 'ख़': 'kh', 'ग़': 'g', 'ज़': 'z', 'ड़': 'r', 'ढ़': 'rh', 'फ़': 'f'
  };

  let result = '';
  let i = 0;

  while (i < word.length) {
    let char = word[i];
    let nextChar = word[i + 1] || '';

    let baseChar = char;
    if (nextChar === '़') {
      baseChar = char + '़';
      i++;
      nextChar = word[i + 1] || '';
    }

    if (CONSONANTS[baseChar] || NUKTA_CONSONANTS[baseChar]) {
      const latCons = NUKTA_CONSONANTS[baseChar] || CONSONANTS[baseChar];
      result += latCons;

      const nextIsVowelSign = VOWEL_SIGNS[nextChar] !== undefined;
      const nextIsHalant = nextChar === '्';
      const nextIsSpaceOrPunct = !nextChar || /[\s\p{P}]/u.test(nextChar);

      if (nextIsHalant) {
        i++;
      } else if (nextIsVowelSign) {
        // Vowel sign handles sound
      } else if (nextIsSpaceOrPunct) {
        // Schwa deletion
      } else {
        result += 'a';
      }
    } else if (VOWELS[baseChar]) {
      result += VOWELS[baseChar];
    } else if (VOWEL_SIGNS[baseChar]) {
      result += VOWEL_SIGNS[baseChar];
    } else if (baseChar === '्') {
      // skip
    } else {
      result += baseChar;
    }

    i++;
  }

  // Final aa cleanup
  result = result.replace(/aa(\s|$)/g, 'a$1');
  return result;
}

/**
 * Main entry point for Hinglish transliteration.
 * Preprocesses words using dictionaries for correct English loanwords and common connectives.
 * 
 * @param {string} text - Devanagari Hindi input text
 * @returns {string} - Clean, highly natural Hinglish text
 */
export function transliterateDevanagariToHinglish(text) {
  if (!text) return '';

  // 1. Convert Devanagari full stop (।) to standard period (.)
  let processedText = text.replace(/।/g, '.');

  // 2. Tokenize by splitting on word boundaries (words, punctuation, spaces)
  const tokens = processedText.split(/(\s+|[.,!?;:()""'\-—।])/g);

  const transliteratedTokens = tokens.map(token => {
    if (!token) return '';
    
    // If token is punctuation or spaces, return as-is
    if (/^\s+$/.test(token) || /^[.,!?;:()""'\-—]$/.test(token)) {
      return token;
    }

    // Isolate word from case variations (we map lowercase for lookup)
    const baseWord = token.trim();
    
    // Check English loanword map
    if (LOANWORDS_MAP[baseWord] !== undefined) {
      return LOANWORDS_MAP[baseWord];
    }
    
    // Check common Hindi word map
    if (COMMON_HINDI_MAP[baseWord] !== undefined) {
      return COMMON_HINDI_MAP[baseWord];
    }

    // Fallback to rules-based phonetic mapper
    // Check if the token actually contains Devanagari characters
    if (/[\u0900-\u097F]/.test(baseWord)) {
      return ruleBasedTransliterate(baseWord);
    }

    // If it's already English/digits, leave as-is
    return token;
  });

  return transliteratedTokens.join('');
}

/**
 * Restores English loanwords written in Devanagari to Latin script,
 * while leaving native Hindi words untouched in Devanagari script.
 */
export function restoreEnglishLoanwords(text) {
  if (!text) return text;
  
  // Use the same regex split to isolate words and punctuation
  const tokens = text.split(/([\s.,!?()"'-]+)/);
  
  const restoredTokens = tokens.map(token => {
    // If it's pure punctuation/whitespace, keep it
    if (!token.trim() || /^[\s.,!?()"'-]+$/.test(token)) {
      return token;
    }
    
    const baseWord = token.trim();
    
    // Check English loanword map
    if (LOANWORDS_MAP[baseWord] !== undefined) {
      return LOANWORDS_MAP[baseWord];
    }
    
    // Otherwise, return original Devanagari text
    return token;
  });

  return restoredTokens.join('');
}
