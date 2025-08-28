import { useRef, useEffect, useState } from 'react'
import * as echarts from 'echarts/core'
import { GridComponent } from 'echarts/components'
import { LineChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import axios from 'axios'

export default function LineGraph() {

  const chartRef = useRef(null)
  const chartInstanceRef = useRef(null)
  const [dataExist, setDataExist] = useState(false)

  useEffect(() => {
    echarts.use([GridComponent, LineChart, CanvasRenderer, UniversalTransition])

    let myChart = null
    let resizeObserver = null

    // 确保组件挂载完成后再初始化图表
    setTimeout(() => {
      const chartDom = chartRef.current
      if (!chartDom) return

      // 销毁旧图表实例(如果有)
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose()
      }

      // 初始化图表
      myChart = echarts.init(chartDom)
      chartInstanceRef.current = myChart

      // 创建ResizeObserver监听容器大小变化
      resizeObserver = new ResizeObserver(() => {
        if (myChart) {
          myChart.resize()
        }
      })

      // 监听容器大小变化
      resizeObserver.observe(chartDom)

      let option = {
        xAxis: {
          type: 'category',
          data: null
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: null,
            type: 'line'
          }
        ]
      };

      // 加载数据
      const loadData = async () => {
        try {
          const res = await axios.get('/api/documents/count')
          if (res.status === 200) {
            const data = res.data.data
            option.xAxis.data = data.map(item => item.time)
            option.series[0].data = data.map(item => item.count)
            myChart.setOption(option)
            setDataExist(true)
            // 强制重绘图表
            myChart.resize()
          }
        } catch (error) {
          console.error(error)
          setDataExist(false)
        }
      }

      loadData()

      // 手动触发resize事件
      window.dispatchEvent(new Event('resize'))

    }, 500)

    // 添加窗口resize监听
    const handleResize = () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.resize();
      }
    }

    window.addEventListener('resize', handleResize)

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize)

      if (resizeObserver) {
        resizeObserver.disconnect()
      }

      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose()
        chartInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div className='w-full h-full flex flex-col items-center justify-start border-1 border-gray-200 rounded-2xl overflow-hidden'>
      <div 
        ref={chartRef} 
        className={`w-full ${dataExist ? 'block' : 'hidden'}`} 
        style={{ height: '100%', overflow: 'hidden' }}
      >
      </div>

      <div className={`w-full h-full ${dataExist ? 'hidden' : 'block'} flex items-center justify-center`}>
        <h3 className='text-2xl font-bold'>数据加载失败，无法渲染图表</h3>
      </div>
    </div>
  )
}