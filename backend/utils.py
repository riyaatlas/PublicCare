from datetime import datetime

def generate_ticket(department):
    prefix_map = {
        'water': 'WAT',
        'electricity': 'ELC',
        'roads': 'RDS',
        'waste': 'WST',
        'healthcare': 'HLC',
        'unknown': 'OTH'
    }
    dept_key = (department or 'unknown').lower()
    prefix = prefix_map.get(dept_key, 'OTH')
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    return f"{prefix}-{timestamp}"

def map_category_to_department(category):
    cat = (category or '').lower()
    if any(k in cat for k in ['water', 'tap', 'pipeline', 'leak']):
        return 'water'
    if any(k in cat for k in ['electric', 'light', 'power', 'streetlight', 'electrical']):
        return 'electricity'
    if any(k in cat for k in ['road', 'pothole', 'pavement', 'traffic']):
        return 'roads'
    if any(k in cat for k in ['garbage', 'waste', 'dump', 'trash']):
        return 'waste'
    if any(k in cat for k in ['hospital', 'doctor', 'clinic', 'health', 'medical']):
        return 'healthcare'
    return 'unknown'
