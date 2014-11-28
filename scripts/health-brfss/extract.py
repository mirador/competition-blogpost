# Extracts columns from the input file in tsv format, saves the output to the specified 
# tsv file.

input_filename = "data.tsv"
output_filename = "Exercise-Health.tsv"
columns = ["AGE", "QLACTLM2", "SEX", "INCOME2", "EXERANY2", "GENHLTH"]

import csv

reader = csv.reader(open(input_filename, "r"), delimiter="\t")
titles = reader.next()

idxs = [titles.index(var) for var in columns]
writer = csv.writer(open(output_filename, "w"), delimiter="\t")
titles1 = [titles[idx] for idx in idxs]
writer.writerow(titles1)
for row in reader:
    row1 = [row[idx] for idx in idxs]
    writer.writerow(row1)
    