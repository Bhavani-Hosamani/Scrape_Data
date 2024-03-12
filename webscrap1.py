
#
# https://bevco.in/documents-reports/#
# https://stateexcise.karnataka.gov.in/page/Sales/District+wise+Beer+Sales/en
# https://ksbcl.com/ksbcl_monthlysalesreport.html


import requests
from bs4 import BeautifulSoup
import pandas as pd

def scrape_data(url):
    try:
        page = requests.get(url)
        soup = BeautifulSoup(page.text, 'html.parser')
        table = soup.find_all('table')[1]

        world_titles = table.find_all('th')
        world_table_titles = [title.text.strip() for title in world_titles]
        # print(world_table_titles)
        df = pd.DataFrame(columns=world_table_titles)
        
        column_data = table.find_all('tr')
        # print(column_data)
        for row in column_data[1:]:
            # print(row)
            row_data = row.find_all('td')
            # print(row_data)
            individual_row_data = [data.text.strip() for data in row_data]
            print(individual_row_data)
            # print(type(individual_row_data))

            if len(world_table_titles) == len(individual_row_data):
                df.loc[len(df)] = individual_row_data
                # print(type(df))
            else:
                print("Mismatched columns. Skipping row:", individual_row_data)

        return df
        # for i in df:
        #     print(type(i))

    except Exception as e:
        print("Error scraping data:", e)
        return None


def send_data(data):
    try:
        url = 'http://localhost:5000/apiData' 
        headers = {'Content-Type': 'application/json'}
        data_json = data.to_json(orient='records')

        response = requests.post(url, data=data_json, headers=headers)
        # print(response)    
        if response.status_code == 200:
            print("Data sent successfully")
        else:
            print("Error sending data:", response.text)
    except Exception as e:
        print("Error sending data1:", e)


if __name__ == '__main__':
     #  print(__name__)
     url = 'https://en.wikipedia.org/wiki/List_of_largest_companies_in_the_United_States_by_revenue'
     scraped_data = scrape_data(url)

if scraped_data is not None:
    send_data(scraped_data)