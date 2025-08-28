import zipfile
import xml.etree.ElementTree as ET
import sys
import os
import io

# Set stdout to handle Unicode properly
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def analyze_pptx(filepath):
    """Analyze PPTX file structure and text content"""
    
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    
    print(f"Analyzing: {filepath}\n")
    
    with zipfile.ZipFile(filepath, 'r') as zf:
        # List all files
        print("=== FILES IN PPTX ===")
        for file_info in zf.filelist[:10]:  # Show first 10 files
            print(f"  {file_info.filename}")
        
        # Find slide files
        slide_files = [f for f in zf.namelist() if f.startswith('ppt/slides/slide') and f.endswith('.xml')]
        slide_files.sort()
        
        print(f"\n=== FOUND {len(slide_files)} SLIDES ===\n")
        
        for slide_file in slide_files:
            print(f"\n--- {slide_file} ---")
            
            with zf.open(slide_file) as sf:
                content = sf.read()
                
                # Parse XML
                root = ET.fromstring(content)
                
                # Define namespaces
                namespaces = {
                    'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
                    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main'
                }
                
                # Find all text elements
                texts = []
                for elem in root.findall('.//a:t', namespaces):
                    if elem.text:
                        texts.append(elem.text)
                
                if texts:
                    print("Text found:")
                    for i, text in enumerate(texts, 1):
                        # Show first 100 chars and check for special characters
                        display_text = text[:100] if len(text) > 100 else text
                        print(f"  {i}. [{len(text)} chars] {repr(display_text)}")
                        
                        # Check for markdown artifacts
                        if '**' in text or '##' in text or '>' in text or '*' in text:
                            print(f"     ⚠️  Contains markdown: {text[:50]}")
                        
                        # Check for HTML entities
                        if '&' in text and ';' in text:
                            print(f"     ⚠️  May contain HTML entities")
                else:
                    print("  No text found in this slide")
                
                # Check raw XML for issues
                content_str = content.decode('utf-8')
                if '**' in content_str or '##' in content_str:
                    print("  ⚠️  Raw XML contains markdown symbols!")

# Analyze the downloaded file
if len(sys.argv) > 1:
    analyze_pptx(sys.argv[1])
else:
    # Try to find the file
    download_path = os.path.expanduser("~/Downloads")
    pptx_files = [f for f in os.listdir(download_path) if f.endswith('.pptx') and 'presentation' in f.lower()]
    
    if pptx_files:
        latest = max([os.path.join(download_path, f) for f in pptx_files], key=os.path.getmtime)
        print(f"Found recent PPTX: {latest}")
        analyze_pptx(latest)
    else:
        print("Usage: python analyze_pptx.py <path_to_pptx_file>")
        print("Or place a 'presentation.pptx' file in Downloads folder")