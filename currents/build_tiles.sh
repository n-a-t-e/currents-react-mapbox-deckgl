# download nc x and y components
wget https://hpfx.collab.science.gc.ca/20230106/WXO-DD/model_ciops/salish-sea/500m/00/048/20230106T00Z_MSC_CIOPS-SalishSea_SeaWaterVelocityY_DBS-0.5m_LatLon0.008x0.005_PT048H.nc
wget https://hpfx.collab.science.gc.ca/20230106/WXO-DD/model_ciops/salish-sea/500m/00/048/20230106T00Z_MSC_CIOPS-SalishSea_SeaWaterVelocityX_DBS-all_LatLon0.008x0.005_PT048H.nc

# merge u and v into one .nc file
cdo merge *nc currents_uv.nc

# create csv file
python wind_uv.py

# tippecanoe to create tileset of vector files
rm -rf ../tiles

tippecanoe currents.csv -e ../tiles --no-tile-compression --force --drop-fraction-as-needed --drop-densest-as-needed -z11 -Z6 --maximum-tile-bytes=50000

# --maximum-tile-features=

# double check pbf tiles with
# tippecanoe-decode tiles/0/0/0.pbf 0 0 0
