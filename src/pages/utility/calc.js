const data = [
     {
         "_id": "69cf6ba8df35af7503b1920d",
         "taxiDistance": "100",
         "taxiDistances": [100, 150, 200, 100],
     }
]

const findById = (req) => data.find((item) => item._id === req.params.id);

if (findById) {
    const update = "UPDATED";
    const updateRrc = findById.taxiDistances.find((distance) => distance > req.body.taxiDistance)
    if (updateRrc > req.body.taxiDistance && updateRrc > findById.distance) {
        return UPDATE
    } else {
        return "NOT UPDATED"
    }
}