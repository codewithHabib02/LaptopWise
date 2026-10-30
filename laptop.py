import pandas as pd  
import matplotlib.pyplot as plt  
import seaborn as sns 

from sklearn.model_selection import train_test_split,GridSearchCV
from sklearn.metrics import r2_score,mean_absolute_error,mean_squared_error,root_mean_squared_error
from imblearn.pipeline import Pipeline 
from xgboost import XGBRegressor
from sklearn.inspection import permutation_importance
import joblib 
from sklearn.ensemble import RandomForestRegressor ,ExtraTreesRegressor
from catboost import CatBoostRegressor
from sklearn.impute import SimpleImputer 
from sklearn.compose import ColumnTransformer 
from sklearn.preprocessing import OneHotEncoder,StandardScaler 
from sklearn.svm import SVR 


df=pd.read_csv('laptop_price.csv',encoding="latin1")
def print_section(title,data):
    print("\n" + '='*60)
    print(title)
    print("\n" + "=" * 60)
    print(data)
print_section("Head:", df.head())  
print_section("Info:",df.info)
print_section("Dtypes:", df.dtypes)
print_section("Cols:",df.columns.tolist())
print_section("Missing_values:",df.isnull().sum())
print_section("Missing_values:", df.isnull().sum().sum())
print_section("Missing_val_%:",df.isnull().sum()/len(df)*100)
print_section("Duplicated_values:",df.duplicated().sum())
print_section("Data_Description:",df.describe()) 


for c in df.columns:
    print(f"\nColumn Name: {c}")
    print("Value Counts:\n", df[c].value_counts())
    print("Number of Unique Values:", df[c].nunique())
    print("Unique Values:\n", df[c].unique())
    print("-" * 50)
    

categorical_c = df.select_dtypes(include=['category', 'object']).columns.tolist()

for c in categorical_c:
    df[c] = (
        df[c]
        .astype('string')
        .str.replace("'", "", regex=False)
        .str.replace('"', '', regex=False)
        .str.strip()
        .astype('category')
    )
    
numeric_c = df.select_dtypes(include=['object', 'string']).columns.tolist()

for c in numeric_c:
    df[c] = (
        df[c]
        .str.replace("'", "", regex=False)
        .str.replace('"', '', regex=False)
        .str.strip()
    ) 

features = [
    'Company',
    'TypeName',
    'Inches',
    'ScreenResolution',
    'Cpu',
    'Ram',
    'Memory',
    'Gpu'
]

x=df[features]
y=df['Price_euros']   


numeric_c=x.select_dtypes(include=['number']).columns.tolist()
categorical_c=x.select_dtypes(include=['object','category']).columns.tolist()

numeric_impute=Pipeline([
    ("impute",SimpleImputer(strategy='mean')),
    ("scaler",StandardScaler())
])

categorical_impute=Pipeline([
    ("impute",SimpleImputer(strategy='most_frequent')),
    ("encoder",OneHotEncoder(handle_unknown='ignore'))
])

preprocessor=ColumnTransformer(transformers=[
    ("num",numeric_impute,numeric_c),
    ("cat",categorical_impute,categorical_c)
])



x_train,x_test,y_train,y_test=train_test_split(x,y,test_size=0.2,random_state=42)

collect=[]

models = {

    "CatBoost": CatBoostRegressor(
        verbose=0,
        random_seed=42
    ),

    "SVR": SVR(),

    "Random Forest": RandomForestRegressor(
        n_estimators=200,
        random_state=42
    ),

    "Extra Trees": ExtraTreesRegressor(
        n_estimators=200,
        random_state=42
    )
}

import numpy as np 
for name,model in models.items():
    pip=Pipeline([
        ("prepr",preprocessor),
        ("model",model)
    ])
    pip.fit(x_train,y_train)
    y_pred=pip.predict(x_test)
    
    mse=mean_squared_error(y_test,y_pred)
  
    collect.append({
        "model":   name,
        "R2": r2_score(y_test,y_pred),
        "MAE": mean_absolute_error(y_test,y_pred), 
        "MSE": mse,
        "RMSE":   np.sqrt(mse)
       
    })
    
fnal_df=pd.DataFrame(collect) 
print(fnal_df)

final_m=[]
final_model=Pipeline(steps=[
    ("prepr",preprocessor),
    ("model",CatBoostRegressor(random_state=42,verbose=0))
])

param_grid = {
    "model__iterations": [500, 800, 1000],
    "model__depth": [4, 6, 8,10],
    "model__learning_rate": [0.02,0.03, 0.05, 0.1],
    "model__l2_leaf_reg": [3, 5, 7,9]
}

grid=GridSearchCV(
    final_model,
    param_grid,
    cv=5,
    scoring='neg_mean_absolute_error',
    n_jobs=-1
    
)

grid.fit(x_train,y_train)

print(
    f"Best_params:   {grid.best_params_}\n"
    f"Best_score :   {grid.best_score_}\n"
    f"Best_estimator:{grid.best_estimator_}"
)

best_model=grid.best_estimator_
joblib.dump(best_model,"laptop.pkl")
y_pred=best_model.predict(x_test)

sns.scatterplot(x=y_test,y=y_pred)
plt.plot([y_test.min(),y_test.max()],[y_test.min(),y_test.max()], 'r--')
plt.xlabel('Actual')
plt.ylabel('Predicted')
plt.xticks(rotation=40,ha='right')
plt.grid(True)
plt.show()

residuals=y_test-y_pred
sns.scatterplot(x=y_pred,y=residuals)
plt.axhline(y=0, linestyle='--',color='red')
plt.xlabel('Predicted')
plt.ylabel('Residuals')
plt.show()
mse=mean_squared_error(y_test,y_pred)
  
final_m.append({
        "model":   "Catboost",
        "R2": r2_score(y_test,y_pred),
        "MAE": mean_absolute_error(y_test,y_pred), 
        "MSE": mse,
        "RMSE": np.sqrt(mse)
       
    })
    
fnal_df=pd.DataFrame(final_m) 
print(fnal_df)

perm=permutation_importance(
    best_model,
    x_test,
    y_test,
    random_state=42,
    n_repeats=2,
    scoring='r2',
    n_jobs=-1
)
imp=pd.DataFrame({
    "feature": x_test.columns,
    "importance": perm.importances_mean * 100
}).sort_values(by='importance',ascending=False)

print(imp)


