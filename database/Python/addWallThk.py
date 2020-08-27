from openpyxl import Workbook
from openpyxl import load_workbook
from openpyxl.utils import FORMULAE, get_column_letter
from openpyxl.styles import Font, Fill, NamedStyle, Border, Side, colors, Alignment, PatternFill, Border
from datetime import date, datetime
import json

# LOAD WORKBOOKS
jobnum = '7052'
bom_wb = load_workbook(filename='database/'+jobnum+'/bom_import.xlsx')

# ACTIVATE SHEETS
bom = bom_wb.active

desc = 'E'
sched = 'N'
bomclass = 'O'

bom[sched+'1'] = 'SCHEDULE'
bom[bomclass+'1'] = 'CLASS'

for row in range(2, bom.max_row):

    print_sched = 'None'
    print_class = None

    for each in bom[desc+str(row)].value.split(';'):

        if 'SCH' in each:
            print_sched = each.replace(' X ', 'x').replace(
                ' ', '').replace('SCH', '')

        if ' CL' in each:
            for i in range(len(each.split(' '))):
                if each.split(' ')[i] == 'CL':
                    if each.split(' ')[i+1] != '1':
                        print_class = each.split(' ')[i+1]

        if each == ' XS':
            print_sched = 'XS'

        if each == ' XXS':
            print_sched = 'XXS'

        if '3000#' in each:
            print_class = '3000'

        if '150#' in each:
            print_class = '150'

        if '800#' in each:
            print_class = '800'

        if 'STD' in each and print_sched == None:
            print_sched = each.replace(' X ', 'x').replace(
                ' ', '').replace('WT', '')
            if 'PORT' in print_sched or 'CORPORATE' in print_sched or 'CPLG' in print_sched:
                print_sched = 'STD'

    # PRINT TO WORKBOOK
    bom[sched+str(row)] = print_sched
    bom[bomclass+str(row)] = print_class

# ###### ###### ##    ## ######
# ##     ##  ## ##    ## ##
# ###### ###### ##    ## #####
#     ## ##  ##  ##  ##  ##
# ###### ##  ##    ##    ######

# SAVE NEW SHEET
bom_wb.save(filename='database/'+jobnum+'/bom_export.xlsx')

print('')
print('Complete!')
print('')
