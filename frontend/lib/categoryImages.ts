export const CATEGORY_BG_IMAGES: Record<string, string> = {
  'marketpleisy': 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&h=600&fit=crop',
  'produktovi-magaziny': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1920&h=600&fit=crop',
  'gadzhety-ta-elektronika': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1920&h=600&fit=crop',
  'filmy-ta-kino': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&h=600&fit=crop',
  'kompyuterni-igry': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&h=600&fit=crop',
  'banky-ta-finansy': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&h=600&fit=crop',
  'apteky-ta-medytsina': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1920&h=600&fit=crop',
  'dostavka-ta-pochta': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&h=600&fit=crop',
  'odyah-ta-vzuttya': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=600&fit=crop',
  'azs-ta-avtoservis': 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1920&h=600&fit=crop',
  'transport-ta-taksi': 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1920&h=600&fit=crop',
  'internet-ta-zvyazok': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&h=600&fit=crop',
  'kosmetika-ta-doglyad': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&h=600&fit=crop',
  'restorany-ta-kafe': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&h=600&fit=crop',
  'zabudovnyky-ta-nerukhomist': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&h=600&fit=crop',
  'remont-ta-interer': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=600&fit=crop',
  'navchannya-ta-kursy': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=600&fit=crop',
  'turyzm-ta-hoteli': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920&h=600&fit=crop',
  'zootovary-ta-vetkliniky': 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1920&h=600&fit=crop',
  'robota-ta-vakansiyi': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&h=600&fit=crop',
};

function getCategoryImageUrl(slug: string): string {
  return CATEGORY_BG_IMAGES[slug] ?? 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&h=600&fit=crop';
}

export default getCategoryImageUrl;
