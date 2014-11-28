First, extract the columns included in the analysis from the original World Bank Mirador data file:

```bash
python extract.py
```

The extract.py script must be located in the Mirador project folder. This will generate a file named Expenditure-Researchers.tsv that can be used in the IPython notebook to generate the data file for the visualization.

```bash
ipython notebook
```