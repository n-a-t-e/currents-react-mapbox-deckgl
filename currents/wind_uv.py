import xarray as xr
x=xr.open_dataset("currents_uv.nc")
df=x.to_dataframe()
df=df.reset_index()

df['longitude']=df['longitude']-360

df = df.drop(columns=['latitude_longitude'])
df=df.query("not vozocrtx.isnull() and not vomecrty.isnull()")

df=df.rename(columns={"vozocrtx":"curr_x","vomecrty":"curr_y"})

df['curr_x']=df['curr_x'].round(5)
df['curr_y']=df['curr_y'].round(3)

df['longitude']=df['longitude'].round(5)
df['latitude']=df['latitude'].round(5)

# TODO this is a workaround to deckgl converting the lat/long to 'local' projection
df['lon1']=df['longitude'].round(5)
df['lat1']=df['latitude'].round(5)

df.to_csv("currents.csv",index=False)

