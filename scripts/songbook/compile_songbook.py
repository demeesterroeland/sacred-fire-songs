import os
import sys
import subprocess
import argparse

def compile_pdf(input_dir, output_pdf, no_grids=True, toc=True):
    if not os.path.isdir(input_dir):
        print(f"Error: Input directory '{input_dir}' does not exist.")
        sys.exit(1)
        
    # Find and sort all .cho files in the directory
    cho_files = [
        os.path.join(input_dir, f)
        for f in os.listdir(input_dir)
        if f.endswith('.cho')
    ]
    
    if not cho_files:
        print(f"No .cho files found in '{input_dir}'.")
        return
        
    # Sort files alphabetically
    cho_files.sort(key=lambda x: os.path.basename(x).lower())
    print(f"Found {len(cho_files)} ChordPro files in '{input_dir}'.")
    
    # Formulate chordpro command
    cmd = ['chordpro', '--page-size=a4', '--define=pdf.songbook.align-songs=false', '-o', output_pdf]
    
    if toc:
        cmd.append('--toc')
    if no_grids:
        cmd.append('--no-chord-grids')
        
    # Append the list of files
    cmd.extend(cho_files)
    
    print(f"Compiling PDF to '{output_pdf}'...")
    try:
        subprocess.run(cmd, check=True)
        print(f"Successfully generated songbook PDF at '{output_pdf}'!")
    except FileNotFoundError:
        print("Error: 'chordpro' CLI tool is not installed or not in PATH.")
        sys.exit(1)
    except subprocess.CalledProcessError as e:
        print(f"Error compiling songbook: {e}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Compile a directory of ChordPro (.cho) files into a single PDF.")
    parser.add_argument("input_dir", help="Directory containing .cho files")
    parser.add_argument("output_pdf", help="Filename of the generated PDF")
    parser.add_argument("--grids", action="store_true", help="Print chord diagrams at the end of songs (disabled by default)")
    parser.add_argument("--no-toc", action="store_true", help="Suppress table of contents")
    
    args = parser.parse_args()
    
    compile_pdf(
        input_dir=args.input_dir,
        output_pdf=args.output_pdf,
        no_grids=not args.grids,
        toc=not args.no_toc
    )

if __name__ == '__main__':
    main()
