#!/bin/bash

if [ -z "$MINIMAX_API_KEY" ]; then
    echo "Error: MINIMAX_API_KEY environment variable is not set"
    exit 1
fi

response=$(curl -s --location 'https://www.minimaxi.com/v1/api/openplatform/coding_plan/remains' \
    --header "Authorization: Bearer $MINIMAX_API_KEY" \
    --header 'Content-Type: application/json')

if [ $? -ne 0 ]; then
    echo "Error: Failed to connect to Minimax API"
    exit 1
fi

status_code=$(echo "$response" | jq -r '.base_resp.status_code // empty')
if [ "$status_code" != "0" ]; then
    echo "Error: $(echo "$response" | jq -r '.base_resp.status_msg')"
    exit 1
fi

echo "================================"
echo "    Minimax Account Usage"
echo "================================"
echo ""

echo "$response" | jq -c '.model_remains[]' | while read -r model; do
    model_name=$(echo "$model" | jq -r '.model_name')
    total=$(echo "$model" | jq -r '.current_interval_total_count')
    remaining=$(echo "$model" | jq -r '.current_interval_usage_count')
    remains=$(echo "$model" | jq -r '.remains_time')
    start_ts=$(echo "$model" | jq -r '.start_time')
    end_ts=$(echo "$model" | jq -r '.end_time')

    used=$((total - remaining))
    usage_percent=$(awk "BEGIN {printf \"%.1f\", ($used/$total)*100}")

    start_date=$(date -r $((start_ts / 1000)) "+%Y-%m-%d %H:%M" 2>/dev/null || date -d @$((start_ts / 1000)) "+%Y-%m-%d %H:%M")
    end_date=$(date -r $((end_ts / 1000)) "+%Y-%m-%d %H:%M" 2>/dev/null || date -d @$((end_ts / 1000)) "+%Y-%m-%d %H:%M")

    # remains_time is in milliseconds, convert to seconds
    remains_sec=$((remains / 1000))
    days=$((remains_sec / 86400))
    hours=$(((remains_sec % 86400) / 3600))
    minutes=$(((remains_sec % 3600) / 60))

    echo "Model: $model_name"
    echo "--------------------------------"
    echo "  Period:         $start_date to $end_date"
    echo "  Quota:          $total requests"
    echo "  Used:           $used requests ($usage_percent%)"
    echo "  Remaining:      $remaining requests"
    echo "  Resets In:      ${days}d ${hours}h ${minutes}m"
    echo ""
done

echo "================================"
echo "Query Time: $(date '+%Y-%m-%d %H:%M:%S')"
echo "================================"
