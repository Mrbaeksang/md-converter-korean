import pandas as pd
import sys
import os

# UTF-8 인코딩 설정
os.environ['PYTHONIOENCODING'] = 'utf-8'
sys.stdout.reconfigure(encoding='utf-8')

try:
    # Excel 파일 읽기
    file_path = r'C:\Users\qortk\Downloads\document (1).xlsx'
    
    # 모든 시트 이름 확인
    xl_file = pd.ExcelFile(file_path)
    print("=== Excel File Analysis ===")
    print(f"Sheet names: {xl_file.sheet_names}")
    
    # 첫 번째 시트 읽기
    df = pd.read_excel(file_path, sheet_name=0, header=None)
    
    print(f"\nSheet: {xl_file.sheet_names[0]}")
    print(f"Shape: {df.shape[0]} rows x {df.shape[1]} columns")
    print("\n=== Content (All rows) ===\n")
    
    # 모든 내용 출력
    pd.set_option('display.max_rows', None)
    pd.set_option('display.max_columns', None)
    pd.set_option('display.width', None)
    pd.set_option('display.max_colwidth', None)
    
    print(df.to_string())
    
    # 빈 행 확인
    print("\n=== Empty rows ===")
    empty_rows = df[df.isna().all(axis=1)].index.tolist()
    print(f"Empty row indices: {empty_rows}")
    
    # 데이터 타입 확인
    print("\n=== Data types per column ===")
    for col in df.columns:
        non_null = df[col].dropna()
        if len(non_null) > 0:
            print(f"Column {col}: {non_null.dtype}")
            
    # 숫자 데이터 확인
    print("\n=== Numeric values detected ===")
    for col in df.columns:
        numeric_values = pd.to_numeric(df[col], errors='coerce').dropna()
        if len(numeric_values) > 0:
            print(f"Column {col} has {len(numeric_values)} numeric values")
            
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()