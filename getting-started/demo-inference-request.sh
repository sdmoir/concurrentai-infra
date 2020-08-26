PORT=$1

curl -X GET http://localhost:$PORT/wine \
-H 'Content-Type: application/json;' \
--data-binary @- << EOF
{
    "columns": [
        "alcohol",
        "chlorides",
        "citric acid",
        "density",
        "fixed acidity",
        "free sulfur dioxide",
        "pH",
        "residual sugar",
        "sulphates",
        "total sulfur dioxide",
        "volatile acidity"
    ],
    "data": [
        [
            12.8,
            0.029,
            0.48,
            0.98,
            6.2,
            29,
            3.33,
            1.2,
            0.39,
            75,
            0.66
        ]
    ]
}
EOF