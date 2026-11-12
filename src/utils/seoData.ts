import { ToolId, ToolMetadata } from '../types';

export const TOOLS_METADATA: Record<ToolId, ToolMetadata> = {
  'image-compressor': {
    id: 'image-compressor',
    name: 'Smart Image Compressor & WebP Converter',
    shortName: 'Image Compressor',
    tagline: 'Lossless & High-Efficiency WebP/JPG Client-Side Compression',
    description: 'Compress PNG, JPG, and WEBP images by up to 90% without quality loss directly in your browser. Fast, private, and 100% free with instant download.',
    keywords: [
      'image compressor',
      'convert jpg to webp',
      'client-side image compression',
      'bulk image optimizer',
      'free webp converter',
      'lossless png compress'
    ],
    canonicalUrl: 'https://omnitoolkit.dev/#image-compressor',
    iconName: 'ImageIcon',
    steps: [
      {
        title: '1. Drag & Drop or Select Image',
        description: 'Upload any PNG, JPEG, or WebP image from your computer. Files are never uploaded to any remote server.'
      },
      {
        title: '2. Adjust Quality & Target Dimensions',
        description: 'Tweak the compression quality slider from 10% to 100% and optionally set custom width or height maintaining aspect ratio.'
      },
      {
        title: '3. Compare & Instant Download',
        description: 'Review the side-by-side interactive visual comparison, inspect the exact KB savings percentage, and click Download.'
      }
    ],
    faqs: [
      {
        question: 'Are my images uploaded to any remote server or stored in the cloud?',
        answer: 'No. All image processing, canvas downsampling, and WebP encoding happen strictly inside your browser through HTML5 Canvas and Blob APIs. Your files never leave your device.'
      },
      {
        question: 'What is the optimal compression quality for website speed?',
        answer: 'For modern web applications and blogs, a WebP quality of 75% to 82% offers the sweet spot: invisible difference to human vision while reducing raw file size by 60% to 85%.'
      },
      {
        question: 'Why should I convert my JPG and PNG images to WebP?',
        answer: 'Google explicitly recommends modern formats like WebP for Core Web Vitals (LCP metric). WebP images are typically 25%–35% smaller than comparable JPEGs at equivalent SSIM quality index.'
      },
      {
        question: 'Is there any file size limit for compression?',
        answer: 'Because processing relies on your browser’s local memory and graphics acceleration, you can easily compress high-resolution photos up to 50MB with zero queue times.'
      }
    ]
  },
  'pdf-converter': {
    id: 'pdf-converter',
    name: 'Smart Image to PDF & Document Merger',
    shortName: 'Image to PDF',
    tagline: 'Combine Multiple PNG, JPG & WebP Photos into High-Quality PDF Documents',
    description: 'Convert and merge PNG, JPG, and WebP images into clean, searchable PDF files directly in your browser. Customize page sizes (A4, Letter), margins, orientation, and reorder pages with zero server uploads.',
    keywords: [
      'image to pdf converter',
      'jpg to pdf free',
      'png to pdf online',
      'merge photos to pdf',
      'client side pdf converter',
      'convert pictures to pdf document'
    ],
    canonicalUrl: 'https://omnitoolkit.dev/#pdf-converter',
    iconName: 'FileSpreadsheet',
    steps: [
      {
        title: '1. Upload Images to Convert',
        description: 'Drag and drop or select one or multiple images (PNG, JPG, WebP) from your device.'
      },
      {
        title: '2. Arrange & Configure Layout',
        description: 'Reorder pages, pick page size (A4, Letter, Auto), set margins, and select orientation.'
      },
      {
        title: '3. Instant PDF Generation',
        description: 'Click Generate PDF to compile and download your document directly without waiting in a cloud queue.'
      }
    ],
    faqs: [
      {
        question: 'Are my confidential documents or receipts safe when converting to PDF?',
        answer: 'Yes, 100% private. The PDF generation happens entirely in your local browser memory using JavaScript and HTML5 Canvas. No document or image data ever touches an external server.'
      },
      {
        question: 'Can I reorder or delete pages before saving as PDF?',
        answer: 'Yes! You can drag or click the arrow controls to move pages up and down, delete unwanted images, or add new photos at any point.'
      },
      {
        question: 'What page formats and margin options are supported?',
        answer: 'You can choose between Standard ISO A4, US Letter, or Fit to Image dimensions, with customizable margins (None, 5mm Compact, 10mm Standard) and Portrait/Landscape orientations.'
      }
    ]
  },
  'chat-pdf': {
    id: 'chat-pdf',
    name: 'AI Chat with PDF & Smart Document Assistant',
    shortName: 'AI Chat with PDF',
    tagline: 'Ask Questions, Extract Summaries & Discover Key Takeaways from Any PDF Document',
    description: 'Upload any PDF to extract text in-memory and chat with your document using client-side AI. Get bullet-point executive summaries, extract actionable takeaways, and ask custom questions with 100% zero-server privacy.',
    keywords: [
      'chat with pdf',
      'ai pdf summarizer',
      'pdf question answering',
      'extract pdf text online',
      'private pdf ai assistant',
      'ask pdf questions free'
    ],
    canonicalUrl: 'https://omnitoolkit.dev/#chat-pdf',
    iconName: 'Bot',
    steps: [
      {
        title: '1. Upload Your PDF Document',
        description: 'Drag and drop or select your PDF file. Text is extracted 100% locally in browser memory via PDF.js without remote uploads.'
      },
      {
        title: '2. Choose 1-Click Action or Ask Questions',
        description: 'Click Summarize, Key Takeaways, Action Items, or type your own question into the chat input.'
      },
      {
        title: '3. Review Answers & Cited Pages',
        description: 'Inspect AI answers with cited page numbers, copy snippets, or export the conversation history to Markdown.'
      }
    ],
    faqs: [
      {
        question: 'Are my PDF documents uploaded to external servers or AI training pools?',
        answer: 'No. When using our local smart engine, all parsing and analysis happen 100% inside your browser memory. If you choose to configure your own Gemini or OpenAI API key, only your direct prompt queries are sent to your chosen provider under your private key.'
      },
      {
        question: 'Do I need an API key to use AI Chat with PDF?',
        answer: 'No! The tool includes a built-in Local Smart Extractive NLP engine that generates executive summaries, key findings, FAQs, and answers questions immediately out of the box with zero configuration.'
      },
      {
        question: 'Can I connect my own Google Gemini or OpenAI API key?',
        answer: 'Yes! Open Settings in the tool header to input your Google Gemini (free API key available via Google AI Studio) or OpenAI key for full generative synthesis.'
      },
      {
        question: 'What types of PDFs are supported?',
        answer: 'All standard text PDFs including contracts, whitepapers, financial statements, research papers, and ebooks. For scanned image-only PDFs, please ensure they have selectable text.'
      }
    ]
  },
  'qr-generator': {
    id: 'qr-generator',
    name: 'Smart QR Code Generator & Stylist',
    shortName: 'QR Code Generator',
    tagline: 'High-Resolution Custom QR Codes for URLs, Wi-Fi & Contacts',
    description: 'Generate high-resolution PNG and SVG QR codes for websites, Wi-Fi network credentials, plain text, and emails. Customize foreground/background colors and error correction with instant zero-server downloads.',
    keywords: [
      'qr code generator',
      'free wifi qr code',
      'custom color qr code',
      'url to qr code',
      'svg qr code generator',
      'high resolution qr download'
    ],
    canonicalUrl: 'https://omnitoolkit.dev/#qr-generator',
    iconName: 'QrCode',
    steps: [
      {
        title: '1. Select QR Data Type',
        description: 'Choose between Website URL, Wi-Fi Network Login, Plain Text, or Email Address.'
      },
      {
        title: '2. Personalize Colors & Error Level',
        description: 'Pick custom foreground and background colors, adjust quiet zone margins, and set error correction up to 30% recovery.'
      },
      {
        title: '3. Instant PNG or SVG Export',
        description: 'Click Download PNG (up to 1024px) or vector SVG for crisp print and digital display with zero server uploads.'
      }
    ],
    faqs: [
      {
        question: 'Do the generated QR codes expire?',
        answer: 'No! These are static, client-generated QR codes that encode your data directly into the matrix. They never expire and will work permanently.'
      },
      {
        question: 'What is the Error Correction level in QR codes?',
        answer: 'Error correction allows a QR code to remain readable even if up to 30% of it is smudged, damaged, or covered by a logo (Level H = High 30%, Level M = Medium 15%).'
      },
      {
        question: 'Can I generate a Wi-Fi QR code so guests connect automatically without typing passwords?',
        answer: 'Yes! The Wi-Fi mode formats credentials using the standard WPA/WPA2 specification so iPhones, iPads, and Android devices connect upon pointing their camera.'
      }
    ]
  },
  'markdown-editor': {
    id: 'markdown-editor',
    name: 'Smart Markdown to HTML & PDF Live Editor',
    shortName: 'Markdown Editor',
    tagline: 'Real-Time Markdown Writing, Syntax Highlighting & HTML Compiler',
    description: 'Write, format, and preview GitHub-flavored Markdown in real time. Inspect word counts and reading duration, format tables and code blocks, copy compiled HTML, and export documents directly to PDF.',
    keywords: [
      'markdown editor online',
      'markdown to html converter',
      'github flavored markdown preview',
      'free markdown to pdf',
      'markdown table generator',
      'client side markdown writer'
    ],
    canonicalUrl: 'https://omnitoolkit.dev/#markdown-editor',
    iconName: 'FileEdit',
    steps: [
      {
        title: '1. Write or Paste Markdown',
        description: 'Type formatted text, drag a .md file, or insert formatting using the visual toolbar.'
      },
      {
        title: '2. Live Split-Screen Rendering',
        description: 'Watch the styled GitHub-flavored HTML preview render in real-time as you type, with accurate reading stats.'
      },
      {
        title: '3. Copy HTML or Export Document',
        description: 'Click Copy HTML to embed into blogs and CMS editors, or click Export PDF to save a printable copy.'
      }
    ],
    faqs: [
      {
        question: 'Does this Markdown editor support GitHub Flavored Markdown (GFM)?',
        answer: 'Yes! It fully supports tables, task lists with checkboxes, code fences with syntax formatting, blockquotes, and strikethrough syntax.'
      },
      {
        question: 'Are my notes or draft articles saved anywhere in the cloud?',
        answer: 'No. The entire editing and HTML compilation pipeline operates strictly in your browser memory. Your documents are never stored or transmitted.'
      },
      {
        question: 'Can I export my Markdown notes to a PDF document?',
        answer: 'Yes! You can click the Export PDF button to trigger a clean, print-styled document export suitable for printing or saving.'
      }
    ]
  },
  'social-meta-tags': {
    id: 'social-meta-tags',
    name: 'Social & Video Meta Tag / Hashtag Generator',
    shortName: 'Social Meta & Tags',
    tagline: 'High-CTR YouTube, TikTok & Instagram Viral Title, Tag & Hashtag Engine',
    description: 'Generate high-CTR video titles, keyword-rich video descriptions, and viral hashtag clusters for YouTube, TikTok, Instagram, and X with strict platform character validation.',
    keywords: [
      'youtube tag generator',
      'tiktok hashtag generator',
      'instagram viral hashtags',
      'video meta tag tool',
      'ctr title generator',
      'social media caption builder'
    ],
    canonicalUrl: 'https://omnitoolkit.dev/#social-meta-tags',
    iconName: 'Share2Icon',
    steps: [
      {
        title: '1. Enter Your Topic or Core Keyword',
        description: 'Type your video theme, article subject, or product name (e.g., "Full-Stack AI SaaS in 2026").'
      },
      {
        title: '2. Select Your Niche & Desired Tone',
        description: 'Choose your audience category (Tech, Finance, Gaming, Lifestyle) and tone (Viral Curiosity Hook, High-CTR, Professional SEO).'
      },
      {
        title: '3. Copy Ready-to-Publish Metadata',
        description: 'Click any tag, generated title, or full description to copy with live character counters respecting platform limits.'
      }
    ],
    faqs: [
      {
        question: 'How does this tool help my YouTube and TikTok algorithmic reach?',
        answer: 'It balances search intent (high-volume SEO keywords in the first 50 characters of titles and descriptions) with curiosity hooks that increase Click-Through Rate (CTR) and initial watch duration.'
      },
      {
        question: 'What are the current character limits for YouTube, TikTok, and Instagram?',
        answer: 'YouTube titles allow 100 characters (first 60 are key before truncation); descriptions allow 5,000 characters; tag blocks allow 500 characters. TikTok captions allow 2,200 characters. Instagram captions allow 2,200 characters and up to 30 hashtags.'
      },
      {
        question: 'Are the generated hashtags updated with trending patterns?',
        answer: 'Yes! The generator leverages multi-tier distribution: 30% broad high-reach hashtags, 50% niche-specific topical tags, and 20% long-tail intent hashtags to maximize discovery.'
      }
    ]
  },
  'developer-tools': {
    id: 'developer-tools',
    name: 'Developer & Data Formatter Suite',
    shortName: 'Dev & Data Formatter',
    tagline: 'Client-Side JSON Formatter, Minifier, Base64 & URL Encoder / Decoder',
    description: 'Format, validate, and minify messy JSON data with line-by-line syntax error detection. Convert files and strings to Base64, encode URLs, and generate cryptographic SHA hashes instantly.',
    keywords: [
      'json formatter validator',
      'json minifier online',
      'base64 image encoder',
      'url encoder decoder',
      'crypto sha256 generator',
      'developer utilities client-side'
    ],
    canonicalUrl: 'https://omnitoolkit.dev/#developer-tools',
    iconName: 'Code2Icon',
    steps: [
      {
        title: '1. Choose Your Utility Module',
        description: 'Switch between JSON Beautifier/Validator, Base64 Text & File Converter, URL Encoder/Decoder, or Crypto Hashes.'
      },
      {
        title: '2. Paste Raw Content or Drag a File',
        description: 'Paste unformatted payloads or drag any media file to automatically generate Data URIs and Base64 strings.'
      },
      {
        title: '3. Format, Validate, or Minify with 1-Click',
        description: 'Detect schema syntax errors instantly, click Minify or Format (2/4 spaces), and copy or download the output.'
      }
    ],
    faqs: [
      {
        question: 'Is it safe to format sensitive JSON API keys or tokens here?',
        answer: 'Yes, 100% safe. Because this entire application operates strictly on the client side with zero backend servers, your API tokens, customer payloads, and secret keys never touch a server.'
      },
      {
        question: 'Can I convert binary images to Base64 Data URIs directly?',
        answer: 'Yes! The Base64 module includes a direct file-to-Data-URI converter allowing you to embed SVG, PNG, and JPG images straight into HTML/CSS source code.'
      },
      {
        question: 'Does the JSON validator pinpoint the exact syntax error line?',
        answer: 'Yes, our parser intercepts JSON parse exceptions, pinpoints the exact line number, column, and nearby offending characters, saving you hours of manual debugging.'
      }
    ]
  },
  'freelance-calculator': {
    id: 'freelance-calculator',
    name: 'Freelancer & Creator Profit Calculator',
    shortName: 'Profit Calculator',
    tagline: 'Net Take-Home Pay, Platform Fees (Upwork/Fiverr/Stripe) & Tax Estimator',
    description: 'Accurately calculate your real hourly rate, platform commission cuts (Upwork, Fiverr, Stripe), operating business expenses, and estimated self-employment tax burden.',
    keywords: [
      'freelance rate calculator',
      'upwork fee calculator',
      'fiverr take home pay',
      'creator profit calculator',
      'self employment tax calculator',
      'effective hourly rate estimator'
    ],
    canonicalUrl: 'https://omnitoolkit.dev/#freelance-calculator',
    iconName: 'CalculatorIcon',
    steps: [
      {
        title: '1. Select Contract Mode & Hourly/Project Rate',
        description: 'Enter your quoted hourly rate or fixed project amount, along with estimated billable weekly hours.'
      },
      {
        title: '2. Choose Platform Fee Preset & Business Expenses',
        description: 'Pick Upwork (10%), Fiverr (20%), Stripe (2.9% + $0.30), or zero fee direct invoice, and specify monthly business overhead.'
      },
      {
        title: '3. View True Net Take-Home Pay & Effective Rate',
        description: 'Inspect the full visual income breakdown, see your tax liability, and export a clean financial summary.'
      }
    ],
    faqs: [
      {
        question: 'Why is the Effective Hourly Rate lower than my quoted rate?',
        answer: 'Most freelancers forget platform commissions (10-20%), merchant processing fees, business software expenses, and self-employment taxes (15.3% in the US). Our calculator reveals what actually hits your personal bank account.'
      },
      {
        question: 'What platform fee presets are included?',
        answer: 'We provide one-click presets for Upwork (10% flat rate), Fiverr (20% seller fee), Stripe (2.9% + $0.30 standard processing), Direct Client Invoicing (0%), plus a custom percentage field.'
      },
      {
        question: 'Can I export my project estimate for client invoicing?',
        answer: 'Yes, you can click "Export Summary" to copy a cleanly formatted markdown breakdown or download a CSV report for your records and client proposals.'
      }
    ]
  },
  'pdf-signer': {
    id: 'pdf-signer',
    name: 'Smart Digital PDF Signer & Form Filler',
    shortName: 'Sign PDF',
    tagline: 'Draw or Type Signatures, Fill Forms & Export Signed PDFs 100% Client-Side',
    description: 'Sign PDF contracts, agreements, and NDAs online for free. Draw your signature with touch/mouse, create typed signatures with elegant handwriting fonts, place text stamps, and download signed PDFs securely without sending data to any external server.',
    keywords: [
      'sign pdf online free',
      'digital pdf signature',
      'client side pdf signer',
      'fill and sign pdf',
      'draw signature on pdf',
      'electronic signature tool',
      'free contract signer'
    ],
    canonicalUrl: 'https://omnitoolkit.dev/#pdf-signer',
    iconName: 'PenToolIcon',
    steps: [
      {
        title: '1. Upload PDF or Try Demo Agreement',
        description: 'Drag and drop any PDF contract or invoice from your device, or click "Try Demo Agreement" to test instantly without uploading.'
      },
      {
        title: '2. Create Your Signature or Stamp',
        description: 'Draw your custom signature smoothly using mouse, trackpad, touchscreen, or Apple Pencil, or type your name with handwriting script fonts.'
      },
      {
        title: '3. Drag, Resize & Position onto PDF',
        description: 'Place signatures, names, today’s date, or initial checkmarks onto any page. Drag to position and scale freely.'
      },
      {
        title: '4. Secure Client-Side Export',
        description: 'Click "Download Signed PDF" to embed your signatures and form elements directly into the document using in-memory pdf-lib.'
      }
    ],
    faqs: [
      {
        question: 'Is my signed PDF uploaded to any server or cloud service?',
        answer: 'No. All PDF page rendering, signature drawing, coordinate mapping, and file generation happen strictly within your browser’s local device memory using pdf-lib and Web APIs. Your confidential legal documents never leave your device.'
      },
      {
        question: 'Are digital signatures created with this tool legally binding?',
        answer: 'In many jurisdictions, electronic signatures created with mutual consent are legally recognized for contracts and agreements under the US ESIGN Act, UETA, and EU eIDAS regulations.'
      },
      {
        question: 'Can I sign on my mobile phone or iPad with touch or stylus?',
        answer: 'Yes. The signature pad supports high-precision touch and stylus events with quadratic curve smoothing for a natural handwriting feel.'
      },
      {
        question: 'Can I sign multi-page documents and place stamps on multiple pages?',
        answer: 'Yes. You can navigate through all pages of your PDF document and place signatures, names, checkmarks, and dates wherever required.'
      }
    ]
  },
  'merge-pdf': {
    id: 'merge-pdf',
    name: 'Merge PDF Online — Combine Multiple PDF Files Free',
    shortName: 'Merge PDF',
    tagline: 'Combine Multiple PDF Files into One Document 100% In-Browser & Secure',
    description: 'Merge multiple PDF documents into a single organized file in seconds. Reorder pages and files with ease. 100% free, private, and runs entirely in local browser memory without uploading your sensitive files to any cloud server.',
    keywords: [
      'merge pdf',
      'combine pdf files',
      'merge pdf online free',
      'join pdf documents',
      'client side pdf merge',
      'secure pdf combiner',
      'merge pdf without uploading'
    ],
    canonicalUrl: 'https://pdf-toolkit-pro-eight.vercel.app/merge-pdf',
    iconName: 'Layers',
    steps: [
      {
        title: '1. Select or Drag Multiple PDF Files',
        description: 'Upload two or more PDF documents from your computer, phone, or tablet. No file limits or waiting queues.'
      },
      {
        title: '2. Reorder Files & Inspect Page Counts',
        description: 'Use the up/down arrows to position documents in your preferred sequence and verify the total combined page count.'
      },
      {
        title: '3. Instant Client-Side Merge & Download',
        description: 'Click "Merge PDFs Now" to concatenate all documents into one single high-quality PDF downloaded directly to your device.'
      }
    ],
    faqs: [
      {
        question: 'Are my confidential documents uploaded to any remote server?',
        answer: 'No. All PDF loading, page extraction, and merging operations occur 100% in your local browser memory using pdf-lib. Your documents never leave your computer.'
      },
      {
        question: 'Is there a limit on how many PDF files I can merge?',
        answer: 'Because processing is executed directly on your device rather than on a constrained shared cloud server, you can merge dozens of PDF files and hundreds of pages without subscription fees or artificial limits.'
      },
      {
        question: 'Will the original PDF layout, bookmarks, or image quality be preserved?',
        answer: 'Yes. The merger uses direct binary page copying, which preserves vector graphics, fonts, embedded images, and original page resolutions losslessly.'
      },
      {
        question: 'Can I reorder the PDF documents before merging?',
        answer: 'Yes. You can easily click the Up and Down controls next to any file in the list to rearrange the exact order in which pages appear.'
      }
    ]
  },
  'split-pdf': {
    id: 'split-pdf',
    name: 'Split PDF Online — Extract Pages & Ranges Free',
    shortName: 'Split PDF',
    tagline: 'Extract Specific Pages or Split All Pages into Separate PDF Files',
    description: 'Split PDF documents online for free. Extract custom page ranges (e.g. 1-3, 5, 8-10) or split every page into standalone individual PDF files. Zero server uploads, completely private and instant.',
    keywords: [
      'split pdf',
      'extract pdf pages',
      'split pdf online free',
      'separate pdf pages',
      'extract page range from pdf',
      'free pdf cutter',
      'secure client side pdf split'
    ],
    canonicalUrl: 'https://pdf-toolkit-pro-eight.vercel.app/split-pdf',
    iconName: 'Scissors',
    steps: [
      {
        title: '1. Upload Your PDF Document',
        description: 'Drag and drop or select the PDF you need to divide. Files are loaded securely into browser memory.'
      },
      {
        title: '2. Choose Extraction Mode & Enter Ranges',
        description: 'Select "Extract Specific Pages" with custom ranges (e.g. 1-5, 8), or choose "Split All Pages" to generate individual files.'
      },
      {
        title: '3. Download Extracted PDF Document',
        description: 'Click Download to receive your extracted pages instantly without watermarks or email registration.'
      }
    ],
    faqs: [
      {
        question: 'Can I extract multiple non-consecutive page ranges?',
        answer: 'Yes! You can specify complex ranges like "1-3, 5, 7-10". The tool will combine only those designated pages into your clean output document.'
      },
      {
        question: 'Are my files kept private during splitting?',
        answer: 'Yes, 100%. All processing is performed strictly inside your browser sandbox. No PDF data is ever sent to or stored on any external server.'
      },
      {
        question: 'Can I split encrypted or password-protected PDFs?',
        answer: 'If the PDF has standard open permissions, it can be processed. For password-locked documents, unlock them first before splitting.'
      }
    ]
  },
  'compress-pdf': {
    id: 'compress-pdf',
    name: 'Compress PDF Online — Reduce PDF File Size Free',
    shortName: 'Compress PDF',
    tagline: 'Reduce PDF File Size by up to 80% Without Quality Loss in Browser',
    description: 'Compress PDF documents directly in your browser. Choose between Extreme, Recommended, and Low compression presets to optimize PDFs for email attachments, online forms, and fast web sharing.',
    keywords: [
      'compress pdf',
      'reduce pdf file size',
      'compress pdf online free',
      'shrink pdf size',
      'client side pdf compressor',
      'optimize pdf for email',
      'free pdf size reducer'
    ],
    canonicalUrl: 'https://pdf-toolkit-pro-eight.vercel.app/compress-pdf',
    iconName: 'Zap',
    steps: [
      {
        title: '1. Select PDF to Compress',
        description: 'Drag and drop any PDF file. Inspect the original file size and page count instantly.'
      },
      {
        title: '2. Choose Your Compression Level',
        description: 'Pick "Recommended" for standard email sharing, "Extreme" for strict portal upload limits, or "Low" for maximum print sharpness.'
      },
      {
        title: '3. Download Compressed PDF File',
        description: 'Review your total percentage size reduction and download the optimized PDF with a single click.'
      }
    ],
    faqs: [
      {
        question: 'How does client-side PDF compression work?',
        answer: 'The tool downsamples embedded high-resolution raster images and optimizes page stream objects within browser memory, drastically reducing MBs without requiring remote servers.'
      },
      {
        question: 'Is it safe to compress confidential legal or tax documents?',
        answer: 'Yes. Because our engine operates entirely client-side, your confidential tax returns, financial statements, and contracts are never transmitted over the internet.'
      },
      {
        question: 'Will the compressed PDF retain its original text formatting?',
        answer: 'Yes. Vector layouts and page dimensions are preserved, with images balanced to standard viewing standards (150 DPI for web/email).'
      }
    ]
  },
  'pdf-to-image': {
    id: 'pdf-to-image',
    name: 'PDF to Image Converter — Export PDF to PNG, JPG & WebP',
    shortName: 'PDF to Image',
    tagline: 'Convert PDF Pages to High-Resolution PNG, JPG or WebP Images Free',
    description: 'Convert PDF pages into high-resolution PNG, JPG, or WebP images online. Choose custom DPI resolutions (Standard, 2x High-Res, 3x Ultra-HD) and download individual pages or all pages at once.',
    keywords: [
      'pdf to image',
      'convert pdf to png',
      'pdf to jpg free',
      'pdf to webp converter',
      'extract images from pdf',
      'high resolution pdf to image',
      'client side pdf to image'
    ],
    canonicalUrl: 'https://pdf-toolkit-pro-eight.vercel.app/pdf-to-image',
    iconName: 'Image',
    steps: [
      {
        title: '1. Upload PDF Document',
        description: 'Select any multi-page or single-page PDF document from your device.'
      },
      {
        title: '2. Select Format & Resolution Quality',
        description: 'Choose your desired output format (PNG, JPG, WebP) and resolution scale (1.5x Standard, 2x High-Res, 3x Ultra-HD).'
      },
      {
        title: '3. Convert & Download Images',
        description: 'Inspect interactive page thumbnails and download specific pages or all pages in one click.'
      }
    ],
    faqs: [
      {
        question: 'What image formats can I export my PDF pages to?',
        answer: 'You can export each page as lossless PNG (best for text and graphics), lightweight JPG (best for photos), or modern high-efficiency WebP.'
      },
      {
        question: 'Can I export in high resolution for printing or presentations?',
        answer: 'Yes! Select the "2x High Res" (~200 DPI) or "3x Ultra HD" (~300 DPI) options to produce razor-sharp graphics and crystal-clear text.'
      },
      {
        question: 'Are my documents uploaded during image conversion?',
        answer: 'No. The conversion is performed directly by your browser’s graphics pipeline using HTML5 Canvas and WebAssembly. No data leaves your machine.'
      }
    ]
  }
};
