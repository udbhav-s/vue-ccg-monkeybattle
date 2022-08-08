import json
import sys
import os
import subprocess
import re

template_path = sys.argv[1]
icons_path = sys.argv[2]
out_path = sys.argv[3]
json_path = sys.argv[4]

f = open(json_path,)

cards = json.load(f)

for card in cards:
  cardType = ''
  template = ''
  geometry = ''

  if (card['type'] == 'CREATURE'):
    cardType = 'creature'
    geometry = '450x450+375+180'
    if (card['templateId']):
      geometry='700x700+235+90'

    if ('gameClass' not in card):
      template = 'creatureNeutralTemplate.svg'
    elif (card['gameClass'] == 'Memes'):
      template = 'creatureMemesTemplate.svg'
    elif (card['gameClass'] == 'Movies+TV'):
      template = 'creatureMoviesTvTemplate.svg'
    elif (card['gameClass'] == 'Festive'):
      template = 'creatureFestiveTemplate.svg'
  elif (card['type'] == 'SPELL'):
    cardType = 'spell'
    geometry='450x450+265+200'
    if (card['templateId']):
      geometry='700x700+155+120'

    if ('gameClass' not in card):
      template = 'spellNeutralTemplate.svg'
    elif (card['gameClass'] == 'Memes'):
      template = 'spellMemesTemplate.svg'
    elif (card['gameClass'] == 'Movies+TV'):
      template = 'spellMoviesTvTemplate.svg'
    elif (card['gameClass'] == 'Festive'):
      template = 'spellFestiveTemplate.svg'
  else:
    raise Exception('Type not recognised')
  
  use_template_path = os.path.join(template_path, cardType, template)
  print(use_template_path)

  icon_ext = '.svg'
  
  if 'gif' in card and card['gif']:
    icon_ext = '.gif'
  elif 'templateId' in card:
    icon_ext = '.png'
  
  sanitised_name = re.sub('[^A-Za-z0-9]+', '', card['name'])

  # command = f"magick convert -background none -geometry 450x450+375+180 '{use_template_path}' '{os.path.join(icons_path, card['name'] + '.svg')}' -composite '{os.path.join(out_path, card['name'] + '.png')}'"
  command = [
    "magick", "convert", "-background", "none", "-geometry", geometry,
    use_template_path, os.path.join(icons_path, card['name'] + icon_ext), "-composite",
    os.path.join(out_path, sanitised_name + '.png') ]

  # print(command)
  # imagemagick required installed
  subprocess.Popen(command, stdout=subprocess.PIPE)

f.close()