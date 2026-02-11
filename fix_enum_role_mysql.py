import re

# Allowed ENUM values for 'role'
allowed_roles = set([
    'guest','new','member','artist','band','studio','choir','group','community','label','editor','manager','admin','sadmin','user'
])

def fix_role_value(match):
    value = match.group(1)
    if value not in allowed_roles:
        return "'user'"
    return f"'{value}'"

with open('migration_data_mysql_fixed.sql', 'r') as f:
    sql = f.read()

# Replace any role value not in allowed_roles with 'user'
sql = re.sub(r"'(.*?)'(?=, 'user', 'f', NULL, NULL, 'favour', '', '', NULL, '', 'mstudios', NULL, NULL, NULL, '5', NULL, NULL, NULL, NULL, NULL, NULL)", fix_role_value, sql)
sql = re.sub(r"'(.*?)'(?=, 'user', 'f', NULL, NULL, 'renny', '+2348055787878', '+2348055787878', '1972-11-26', '16 Market Road jP crescent\\nRumuosi Ozuoba link Road', 'mStudios', '{.*}', '{.*}', NULL, '5', NULL, NULL, NULL, NULL, NULL, NULL)", fix_role_value, sql)

with open('migration_data_mysql_enumfixed.sql', 'w') as f:
    f.write(sql)

print('Role values fixed. Output: migration_data_mysql_enumfixed.sql')
