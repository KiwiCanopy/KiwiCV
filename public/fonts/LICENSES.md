# Font licenses

The font files in this directory are third-party works redistributed unmodified. They are not
covered by KiwiCV's own license. Copyright notices below are read from each file's `name` table
(nameID 0 copyright, 13 license description, 14 license URL).

| Family                | Files                                                                               | Version | Copyright                                                                                                              | License                                                                          |
| --------------------- | ----------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Inter                 | `inter-latin-{400,600,700}-{normal,italic}.ttf`, `inter-latin-{500,800}-normal.ttf` | 4.001   | Copyright 2016 The Inter Project Authors (https://github.com/rsms/inter)                                               | SIL OFL 1.1 — [OFL.txt](OFL.txt)                                                 |
| Lora                  | `lora-latin-{400,700}-{normal,italic}.ttf`                                          | 3.008   | Copyright 2011 The Lora Project Authors (https://github.com/cyrealtype/Lora-Cyrillic), with Reserved Font Name "Lora". | SIL OFL 1.1 — [OFL.txt](OFL.txt)                                                 |
| JetBrains Mono        | `jetbrains-mono-latin-{400,700}-{normal,italic}.ttf`                                | 2.211   | Copyright 2020 The JetBrains Mono Project Authors (https://github.com/JetBrains/JetBrainsMono)                         | SIL OFL 1.1 — [OFL.txt](OFL.txt)                                                 |
| Noto Sans CJK JP / SC | `noto-sans-cjk-jp-regular.otf`, `noto-sans-cjk-sc-regular.otf`                      | 2.004   | © 2014-2021 Adobe (http://www.adobe.com/). Noto is a trademark of Google Inc.                                          | SIL OFL 1.1 — [OFL.txt](OFL.txt)                                                 |
| DejaVu Sans           | `DejaVuSans.ttf`                                                                    | 2.37    | Copyright (c) 2003 by Bitstream, Inc. Copyright (c) 2006 by Tavmjong Bah. DejaVu changes are in public domain.         | Bitstream Vera and Arev font licenses — [LICENSE-DejaVu.txt](LICENSE-DejaVu.txt) |

## Sources of the license texts

- [OFL.txt](OFL.txt): the license body is the SIL Open Font License 1.1 verbatim from
  https://openfontlicense.org/documents/OFL.txt, under the copyright lines of the four families
  above.
- [LICENSE-DejaVu.txt](LICENSE-DejaVu.txt): verbatim `LICENSE` of the DejaVu fonts 2.37 release,
  https://github.com/dejavu-fonts/dejavu-fonts/blob/version_2_37/LICENSE. Only its first two parts
  (Bitstream Vera and Arev) apply to `DejaVuSans.ttf`; the TeX Gyre DJV Math part covers a font
  this directory does not ship. The same Bitstream Vera and Arev text is embedded in the file's
  own nameID 13.

The Inter, Lora and JetBrains Mono files are Latin subsets and carry no nameID 13; their nameID 14
points to the OFL (`https://openfontlicense.org` for Inter, `https://scripts.sil.org/OFL` for Lora
and JetBrains Mono). The Noto Sans CJK files carry the OFL 1.1 notice in nameID 13.
