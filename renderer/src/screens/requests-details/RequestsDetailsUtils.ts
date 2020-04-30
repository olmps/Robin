import { RequestCycle } from "../../models"

/**
 * Retrieve and formats the stats - amount, average duration and total size - from 
 * all **complete** cycles.
 */
export function requestsStats(cycles: RequestCycle[]): [string, string, string] {
  if (cycles.length === 0) { return ["0", "0", "0"] }
  
  const completeCycles = cycles.filter(cycle => cycle.isComplete)

  const averageDuration = completeCycles.reduce((a,b) => a + b.duration, 0) / cycles.length
  const formattedDuration = averageDuration >= 1000 ? `${new Date(averageDuration).getSeconds().toFixed(0)} s` :
                                                      `${averageDuration.toFixed(0)} ms`

  const totalSize = completeCycles.reduce((a, b) => a + b.size(), 0)

  return [completeCycles.length.toString(), formattedDuration, formatBytes(totalSize)]
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(0)) + ' ' + sizes[i];
}

/**
 * Requests methods distribution dataset
 */
export function doughnutChartData(cycles: RequestCycle[]) {
  let methodsAmount = [0, 0, 0, 0, 0] // get, put, post, patch, delete
  cycles.forEach(cycle => methodsAmount[cycle.method] += 1)

  return {
      labels: [
          'GET',
          'PUT',
          'POST',
          'PATCH',
          'DELETE'
      ],
      datasets: [{
          data: methodsAmount,
          borderWidth: 0,
          backgroundColor: [
            '#51B261',
            '#BC7446',
            '#4777BB',
            '#E6DA3A',
            '#BC4747'
          ],
          hoverBackgroundColor: [
            '#51B261',
            '#BC7446',
            '#4777BB',
            '#E6DA3A',
            '#BC4747'
          ]
      }]
  }
}

export function doughnutChartOptions(): any {
  return { 
    legend: { 
      position: 'bottom',
      labels: { 
        fontColor: '#FFFFFF'
      }
    }
  }
}