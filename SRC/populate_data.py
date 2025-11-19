import random
import datetime

def escape_sql_string(value):
    if value is None:
        return "NULL"
    return "'" + str(value).replace("'", "''") + "'"

def format_date(date_obj):
    return f"'{date_obj.strftime('%Y-%m-%d')}'"

def format_datetime(dt_obj):
    return f"'{dt_obj.strftime('%Y-%m-%d %H:%M:%S')}'"

# --- Data Generators ---

first_names = ["Socrates", "Plato", "Aristotle", "Immanuel", "Friedrich", "René", "David", "John", "Thomas", "Jean-Jacques", "Karl", "Ludwig", "Bertrand", "Simone", "Hannah", "Hypatia", "Confucius", "Laozi", "Sun", "Gautama"]
last_names = ["Kant", "Nietzsche", "Descartes", "Hume", "Locke", "Hobbes", "Rousseau", "Marx", "Wittgenstein", "Russell", "de Beauvoir", "Arendt", "Sartre", "Camus", "Foucault", "Derrida", "Spinoza", "Leibniz", "Hegel", "Schopenhauer"]
streets = ["Baker St", "Oxford St", "Regent St", "Bond St", "Jermyn St", "Abbey Rd", "Downing St", "Carnaby St", "King's Rd", "Shaftesbury Ave", "Victoria St", "Fleet St", "Cannon St", "Bow St", "Lombard St", "Savile Row", "Edgware Rd", "Kensington High St", "Portobello Rd", "Brick Ln"]
cities = ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Edmonton", "Winnipeg", "Hamilton", "Kitchener", "London"]
provinces = ["ON", "BC", "QC", "AB", "MB", "SK", "NS", "NB", "NL", "PE"]
makes = ["Porsche", "McLaren", "Audi", "Ferrari", "Lamborghini", "Aston Martin", "Bugatti", "Bentley", "Rolls-Royce", "Maserati"]
models = {
    "Porsche": ["911", "Cayenne", "Panamera", "Taycan", "718 Cayman", "718 Boxster", "Macan"],
    "McLaren": ["720S", "570S", "GT", "Artura", "765LT", "P1", "Senna"],
    "Audi": ["R8", "RS e-tron GT", "RS7", "RS6 Avant", "RS Q8", "S8", "SQ8"],
    "Ferrari": ["SF90 Stradale", "F8 Tributo", "Roma", "Portofino M", "812 Superfast", "296 GTB", "Daytona SP3"],
    "Lamborghini": ["Aventador", "Huracán", "Urus", "Revuelto", "Countach", "Sian", "Centenario"],
    "Aston Martin": ["DB11", "Vantage", "DBS", "DBX", "Valhalla", "Valkyrie", "One-77"],
    "Bugatti": ["Chiron", "Veyron", "Divo", "Centodieci", "Bolide", "Mistral", "La Voiture Noire"],
    "Bentley": ["Continental GT", "Flying Spur", "Bentayga", "Mulsanne", "Bacalar", "Batur"],
    "Rolls-Royce": ["Phantom", "Ghost", "Cullinan", "Wraith", "Dawn", "Spectre", "Boat Tail"],
    "Maserati": ["MC20", "Ghibli", "Levante", "Quattroporte", "GranTurismo", "Grecale"]
}
colors = ["Red", "Blue", "Green", "Black", "White", "Silver", "Gray", "Orange", "Yellow", "Brown", "Matte Black", "Metallic Blue", "Racing Green", "Pearl White"]
trims = ["Base", "S", "GTS", "Turbo", "Turbo S", "GT3", "GT3 RS", "Performance", "Carbon Edition", "Spyder"]

# --- Storage for generated IDs to maintain referential integrity ---
salesperson_ids = []
manager_ids = []
customer_ids = []
vehicle_vins = []
available_vins_for_sale = [] # VINs that are 'Available' and can be sold
sale_ids = []
invoice_numbers = []

# --- Generation Functions ---

def generate_salesperson(num):
    statements = []
    for _ in range(num):
        sin = str(random.randint(100000000, 999999999))
        while sin in salesperson_ids:
            sin = str(random.randint(100000000, 999999999))
        salesperson_ids.append(sin)
        
        fname = random.choice(first_names)
        lname = random.choice(last_names)
        commission = round(random.uniform(0.01, 0.15), 2)
        salary = random.randint(30000, 80000)
        
        statements.append(f"INSERT INTO Salesperson (SIN, fName, lName, commission, salary) VALUES ('{sin}', '{fname}', '{lname}', {commission}, {salary});")
    return statements

def generate_manager(num):
    statements = []
    for _ in range(num):
        sin = str(random.randint(100000000, 999999999))
        while sin in manager_ids or sin in salesperson_ids: # Ensure unique SIN across people if needed
             sin = str(random.randint(100000000, 999999999))
        manager_ids.append(sin)
        
        fname = random.choice(first_names)
        lname = random.choice(last_names)
        salary = random.randint(60000, 120000)
        bonus = random.randint(5000, 20000)
        
        statements.append(f"INSERT INTO Manager (SIN, fName, lName, salary, bonus) VALUES ('{sin}', '{fname}', '{lname}', {salary}, {bonus});")
    return statements

def generate_customer(num):
    statements = []
    used_licenses = set()
    for _ in range(num):
        dl = f"DL{random.randint(1000000, 9999999)}"
        while dl in used_licenses:
            dl = f"DL{random.randint(1000000, 9999999)}"
        used_licenses.add(dl)
        customer_ids.append(dl)
        
        fname = random.choice(first_names).replace("'", "''")
        lname = random.choice(last_names).replace("'", "''")
        street = f"{random.randint(1, 999)} {random.choice(streets)}".replace("'", "''")
        city = random.choice(cities).replace("'", "''")
        province = random.choice(provinces)
        postal = f"{random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}{random.randint(0,9)}{random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')} {random.randint(0,9)}{random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}{random.randint(0,9)}"
        birthday = datetime.date(1950, 1, 1) + datetime.timedelta(days=random.randint(0, 20000))
        eflag = random.choice(['TRUE', 'FALSE'])
        tflag = random.choice(['TRUE', 'FALSE'])
        pflag = random.choice(['TRUE', 'FALSE'])
        
        statements.append(f"INSERT INTO Customer (driverLicenseNumber, fName, lName, street, city, province, postalCode, birthday, eFlag, tFlag, pFlag) VALUES ('{dl}', '{fname}', '{lname}', '{street}', '{city}', '{province}', '{postal}', {format_date(birthday)}, {eflag}, {tflag}, {pflag});")
    return statements

def generate_phone_number(num):
    statements = []
    used_phones = set()
    for _ in range(num):
        phone = str(random.randint(1000000000, 9999999999))
        while phone in used_phones:
            phone = str(random.randint(1000000000, 9999999999))
        used_phones.add(phone)
        
        cust_id = random.choice(customer_ids)
        statements.append(f"INSERT INTO PhoneNumber (phoneNumber, driverLicenseNumber) VALUES ('{phone}', '{cust_id}');")
    return statements

def generate_email(num):
    statements = []
    used_emails = set()
    for _ in range(num):
        cust_id = random.choice(customer_ids)
        email = f"{random.choice(first_names).lower()}.{random.choice(last_names).lower()}{random.randint(1,999)}@example.com"
        while email in used_emails:
             email = f"{random.choice(first_names).lower()}.{random.choice(last_names).lower()}{random.randint(1,999)}@example.com"
        used_emails.add(email)
        
        statements.append(f"INSERT INTO Email (emailAddress, driverLicenseNumber) VALUES ('{email}', '{cust_id}');")
    return statements

def generate_vehicle(num):
    statements = []
    used_vins = set()
    used_stock = set()
    for _ in range(num):
        vin = f"VIN{random.randint(1000000000, 9999999999)}"
        while vin in used_vins:
            vin = f"VIN{random.randint(1000000000, 9999999999)}"
        used_vins.add(vin)
        vehicle_vins.append(vin)
        
        stock = f"STK{random.randint(10000, 99999)}"
        while stock in used_stock:
            stock = f"STK{random.randint(10000, 99999)}"
        used_stock.add(stock)
        
        make = random.choice(makes)
        model = random.choice(models[make])
        year = random.randint(2015, 2025)
        trim = random.choice(trims)
        mileage = random.randint(0, 150000)
        color = random.choice(colors)
        
        # Determine status. If we want to sell it later, it MUST be 'Available'.
        # Let's make 80% of vehicles available for sale.
        if random.random() < 0.8:
            status = 'Available'
            available_vins_for_sale.append(vin)
        else:
            status = random.choice(['Sold', 'Pending', 'Available']) # These won't be sold in this script run
        
        acq_cost = random.randint(10000, 40000)
        base_price = int(acq_cost * random.uniform(1.1, 1.3))
        
        statements.append(f"INSERT INTO Vehicle (VIN, stockNumber, modelYear, make, model, trim, mileage, colour, inventoryStatus, acquisitionCost, basePrice) VALUES ('{vin}', '{stock}', {year}, '{make}', '{model}', '{trim}', {mileage}, '{color}', '{status}', {acq_cost}, {base_price});")
    return statements

def generate_test_drive(num):
    statements = []
    used_ids = set()
    vehicle_schedules = {} # {vin: [(start, end), ...]}

    for _ in range(num):
        td_id = random.randint(1, 100000)
        while td_id in used_ids:
            td_id = random.randint(1, 100000)
        used_ids.add(td_id)
        
        # Try to find a non-overlapping slot
        max_retries = 10
        for attempt in range(max_retries):
            vin = random.choice(vehicle_vins)
            start_time = datetime.datetime(2024, 1, 1) + datetime.timedelta(days=random.randint(0, 365), hours=random.randint(9, 17))
            end_time = start_time + datetime.timedelta(minutes=random.randint(15, 60))
            
            overlap = False
            if vin in vehicle_schedules:
                for s, e in vehicle_schedules[vin]:
                    # Check overlap: (StartA < EndB) and (EndA > StartB)
                    if start_time < e and end_time > s:
                        overlap = True
                        break
            
            if not overlap:
                if vin not in vehicle_schedules:
                    vehicle_schedules[vin] = []
                vehicle_schedules[vin].append((start_time, end_time))
                break
        else:
            continue

        status = random.choice(['Completed', 'Scheduled', 'Cancelled'])
        cust_id = random.choice(customer_ids)
        sin = random.choice(salesperson_ids)
        
        statements.append(f"INSERT INTO TestDrive (testDriveID, startTime, endTime, testDriveStatus, driverLicenseNumber, SIN, VIN) VALUES ({td_id}, {format_datetime(start_time)}, {format_datetime(end_time)}, '{status}', '{cust_id}', '{sin}', '{vin}');")
    return statements

def generate_photo(num):
    statements = []
    used_ids = set()
    for _ in range(num):
        p_id = random.randint(1, 100000)
        while p_id in used_ids:
            p_id = random.randint(1, 100000)
        used_ids.add(p_id)
        
        url = f"http://example.com/photos/{p_id}.jpg"
        vin = random.choice(vehicle_vins)
        
        statements.append(f"INSERT INTO Photo (photoID, photoURL, VIN) VALUES ({p_id}, '{url}', '{vin}');")
    return statements

def generate_sale(num):
    statements = []
    used_ids = set()
    
    # Only use VINs that are marked as available for sale
    # Shuffle them to be random
    random.shuffle(available_vins_for_sale)
    
    # We can only generate as many sales as we have available vehicles
    actual_num = min(num, len(available_vins_for_sale))
    
    for i in range(actual_num):
        s_id = random.randint(1, 100000)
        while s_id in used_ids:
            s_id = random.randint(1, 100000)
        used_ids.add(s_id)
        sale_ids.append(s_id)
        
        sale_type = random.choice(['Finance', 'Lease', 'Cash'])
        price = random.randint(15000, 60000)
        down = int(price * random.uniform(0.1, 0.3))
        date = datetime.date(2024, 1, 1) + datetime.timedelta(days=random.randint(0, 365))
        cust_id = random.choice(customer_ids)
        esin = random.choice(salesperson_ids)
        msin = random.choice(manager_ids)
        
        # Pick a unique VIN from our available list
        vin = available_vins_for_sale[i]
        
        statements.append(f"INSERT INTO Sale (saleID, saleType, downPayment, salePrice, saleDate, driverLicenseNumber, eSIN, mSIN, VIN) VALUES ({s_id}, '{sale_type}', {down}, {price}, {format_date(date)}, '{cust_id}', '{esin}', '{msin}', '{vin}');")
    return statements

def generate_payment_schedule(num):
    statements = []
    used_ids = set()
    # One schedule per sale usually
    for s_id in sale_ids[:num]:
        sch_id = random.randint(1, 100000)
        while sch_id in used_ids:
            sch_id = random.randint(1, 100000)
        used_ids.add(sch_id)
        
        amount = random.randint(10000, 50000)
        rate = round(random.uniform(1.9, 7.9), 2)
        months = random.choice([24, 36, 48, 60, 72])
        monthly = round(amount / months * (1 + rate/100), 2)
        start = datetime.date(2024, 1, 1) + datetime.timedelta(days=random.randint(0, 300))
        end = start + datetime.timedelta(days=months*30)
        status = 'Active'
        
        statements.append(f"INSERT INTO PaymentSchedule (scheduleID, totalLoanAmount, interestRate, termDurationMonths, monthlyPayment, startDate, endDate, paymentStatus, saleID) VALUES ({sch_id}, {amount}, {rate}, {months}, {monthly}, {format_date(start)}, {format_date(end)}, '{status}', {s_id});")
    return statements

def generate_invoice(num):
    statements = []
    used_ids = set()
    # One invoice per sale usually
    for s_id in sale_ids[:num]:
        inv_num = f"INV{random.randint(100000, 999999)}"
        while inv_num in used_ids:
            inv_num = f"INV{random.randint(100000, 999999)}"
        used_ids.add(inv_num)
        invoice_numbers.append(inv_num)
        
        gen_date = datetime.datetime(2024, 1, 1) + datetime.timedelta(days=random.randint(0, 300))
        due_date = gen_date.date() + datetime.timedelta(days=30)
        amount = random.randint(100, 5000) # Initial amount, trigger updates it
        status = random.choice(['Paid', 'Unpaid'])
        
        statements.append(f"INSERT INTO Invoice (invoiceNumber, dateGenerated, paymentDueDate, totalAmountDue, invoiceStatus, saleID) VALUES ('{inv_num}', {format_datetime(gen_date)}, {format_date(due_date)}, {amount}, '{status}', {s_id});")
    return statements

def generate_line_item(num):
    statements = []
    used_ids = set()
    
    # Schema has UNIQUE constraint on invoiceNumber in LineItem, so 1:1 relationship.
    # We can only generate as many line items as we have invoices.
    available_invoices = list(invoice_numbers)
    random.shuffle(available_invoices)
    
    actual_num = min(num, len(available_invoices))
    
    for i in range(actual_num):
        l_id = random.randint(1, 1000000)
        while l_id in used_ids:
            l_id = random.randint(1, 1000000)
        used_ids.add(l_id)
        
        name = random.choice(['Service Fee', 'Parts', 'Labor', 'Warranty', 'Registration'])
        desc = "Standard charge"
        amount = round(random.uniform(50, 1000), 2)
        inv_num = available_invoices[i]
        
        statements.append(f"INSERT INTO LineItem (itemID, itemName, itemDescription, amount, invoiceNumber) VALUES ({l_id}, '{name}', '{desc}', {amount}, '{inv_num}');")
    return statements

# --- Main Execution ---

def main():
    all_statements = []
    
    print("Generating Salespeople...")
    all_statements.extend(generate_salesperson(200))
    
    print("Generating Managers...")
    all_statements.extend(generate_manager(50))
    
    print("Generating Customers...")
    all_statements.extend(generate_customer(2500))
    
    print("Generating PhoneNumbers...")
    all_statements.extend(generate_phone_number(3000))
    
    print("Generating Emails...")
    all_statements.extend(generate_email(3000))
    
    print("Generating Vehicles...")
    all_statements.extend(generate_vehicle(2500))
    
    print("Generating Photos...")
    all_statements.extend(generate_photo(3000))
    
    print("Generating TestDrives...")
    all_statements.extend(generate_test_drive(3000))
    
    print("Generating Sales...")
    all_statements.extend(generate_sale(2000))
    
    print("Generating PaymentSchedules...")
    all_statements.extend(generate_payment_schedule(1500)) # Not all sales might have schedules yet
    
    print("Generating Invoices...")
    all_statements.extend(generate_invoice(1500))
    
    print("Generating LineItems...")
    all_statements.extend(generate_line_item(4000))
    
    with open('SQL/populate.sql', 'w') as f:
        f.write("USE dealership;\n") # Assuming database name
        for stmt in all_statements:
            f.write(stmt + "\n")
            
    print("Done! Generated SQL/populate.sql")

if __name__ == "__main__":
    main()
