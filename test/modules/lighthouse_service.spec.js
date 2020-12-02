import axios from 'axios'
import ReportsJson from '../data/reports'
import RobotsJson from '../data/robots'
import FailureTypesJson from '../data/failures_types.json'
import lighthouse from '@/modules/lighthouse_service'
import config from '@/nuxt.config'

describe('lighthouse_service api', () => {
  let mock, response

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('#createPlatesFromBarcodes ', () => {
    let barcodes

    beforeEach(() => {
      mock = jest.spyOn(axios, 'post')
    })

    it('for a single barcode on failure', async () => {
      barcodes = ['aBarcode1']

      response = {
        errors: ['foreign barcode is already in use.']
      }

      mock.mockResolvedValue(response)

      const result = await lighthouse.createPlatesFromBarcodes({
        barcodes
      })

      expect(result).toEqual([response])
      expect(mock).toHaveBeenCalledTimes(1)
      expect(mock).toHaveBeenNthCalledWith(
        1,
        `${config.privateRuntimeConfig.lighthouseBaseURL}/plates/new`,
        { barcode: barcodes[0] }
      )
    })

    it('for a single barcode on success', async () => {
      barcodes = ['aBarcode1']

      response = {
        data: {
          plate_barcode: 'aBarcode1',
          centre: 'tst1',
          number_of_positives: 3
        }
      }

      mock.mockResolvedValue(response)

      const result = await lighthouse.createPlatesFromBarcodes({
        barcodes
      })

      expect(result).toEqual([response])
      expect(mock).toHaveBeenCalledTimes(1)
      expect(mock).toHaveBeenNthCalledWith(
        1,
        `${config.privateRuntimeConfig.lighthouseBaseURL}/plates/new`,
        { barcode: barcodes[0] }
      )
    })

    it('#for multiple barcodes on failure', async () => {
      barcodes = ['aBarcode1', 'aBarcode2']

      const response1 = {
        errors: ['foreign barcode is already in use.']
      }

      const response2 = {
        errors: ['No samples for this barcode']
      }

      mock.mockImplementationOnce(() => response1)
      mock.mockImplementationOnce(() => response2)

      const result = await lighthouse.createPlatesFromBarcodes({
        barcodes
      })

      expect(result).toEqual([response1, response2])
      expect(mock).toHaveBeenCalledTimes(2)
      expect(mock).toHaveBeenNthCalledWith(
        1,
        `${config.privateRuntimeConfig.lighthouseBaseURL}/plates/new`,
        { barcode: barcodes[0] }
      )
      expect(mock).toHaveBeenNthCalledWith(
        2,
        `${config.privateRuntimeConfig.lighthouseBaseURL}/plates/new`,
        { barcode: barcodes[1] }
      )
    })

    it('#for multiple barcodes on success', async () => {
      barcodes = ['aBarcode1', 'aBarcode2']

      const response1 = {
        data: {
          plate_barcode: 'aBarcode1',
          centre: 'tst1',
          number_of_positives: 3
        }
      }

      const response2 = {
        data: {
          plate_barcode: 'aBarcode2',
          centre: 'tst1',
          number_of_positives: 2
        }
      }

      mock.mockImplementationOnce(() => response1)
      mock.mockImplementationOnce(() => response2)

      const result = await lighthouse.createPlatesFromBarcodes({
        barcodes
      })

      expect(result).toEqual([response1, response2])
      expect(mock).toHaveBeenCalledTimes(2)
      expect(mock).toHaveBeenNthCalledWith(
        1,
        `${config.privateRuntimeConfig.lighthouseBaseURL}/plates/new`,
        { barcode: barcodes[0] }
      )
      expect(mock).toHaveBeenNthCalledWith(
        2,
        `${config.privateRuntimeConfig.lighthouseBaseURL}/plates/new`,
        { barcode: barcodes[1] }
      )
    })

    it('#for multiple barcodes on partial success/ failure', async () => {
      barcodes = ['aBarcode1', 'aBarcode2']

      const response1 = {
        errors: ['No samples for this barcode']
      }

      const response2 = {
        data: {
          plate_barcode: 'aBarcode2',
          centre: 'tst1',
          number_of_positives: 2
        }
      }

      mock.mockImplementationOnce(() => response1)
      mock.mockImplementationOnce(() => response2)

      const result = await lighthouse.createPlatesFromBarcodes({
        barcodes
      })

      expect(result).toEqual([response1, response2])
      expect(mock).toHaveBeenCalledTimes(2)
      expect(mock).toHaveBeenNthCalledWith(
        1,
        `${config.privateRuntimeConfig.lighthouseBaseURL}/plates/new`,
        { barcode: barcodes[0] }
      )
      expect(mock).toHaveBeenNthCalledWith(
        2,
        `${config.privateRuntimeConfig.lighthouseBaseURL}/plates/new`,
        { barcode: barcodes[1] }
      )
    })
  })

  describe('#findPlatesFromBarcodes ', () => {
    beforeEach(() => {
      mock = jest.spyOn(axios, 'get')
    })

    it('for a single barcode on success', async () => {
      const barcodes = ['aBarcode1']
      const plates = [
        {
          plate_barcode: 'aBarcode1',
          centre: 'tst1',
          number_of_positives: 3
        }
      ]

      response = { data: { plates } }

      mock.mockResolvedValue(response)

      const result = await lighthouse.findPlatesFromBarcodes({
        barcodes
      })
      const expected = { success: true, plates }

      expect(result).toEqual(expected)
      expect(mock).toHaveBeenCalledTimes(1)
      expect(mock).toHaveBeenNthCalledWith(
        1,
        `${config.privateRuntimeConfig.lighthouseBaseURL}/plates`,
        { params: { barcodes } }
      )
    })

    it('#for multiple barcodes on success', async () => {
      const barcodes = ['aBarcode1', 'aBarcode2']
      const plates = [
        {
          plate_barcode: 'aBarcode1',
          centre: 'tst1',
          number_of_positives: 3
        },
        {
          plate_barcode: 'aBarcode2',
          centre: 'tst1',
          number_of_positives: 2
        }
      ]
      const response = { data: { plates } }

      mock.mockImplementationOnce(() => response)

      const result = await lighthouse.findPlatesFromBarcodes({
        barcodes
      })
      const expected = { success: true, plates }

      expect(mock).toHaveBeenCalledTimes(1)
      expect(mock).toHaveBeenNthCalledWith(
        1,
        `${config.privateRuntimeConfig.lighthouseBaseURL}/plates`,
        { params: { barcodes } }
      )
      expect(result).toEqual(expected)
    })
  })

  describe('#getImports', () => {
    let expected

    beforeEach(() => {
      mock = jest.spyOn(axios, 'get')
    })

    it('returns data successfully', async () => {
      expected = { data: { items: [] } }
      mock.mockResolvedValue(expected)
      response = await lighthouse.getImports()
      expect(response.data).toEqual(expected.data)
    })

    it('when there is an error', async () => {
      mock.mockImplementationOnce(() =>
        Promise.reject(new Error('There was an error'))
      )
      response = await lighthouse.getImports()
      expect(response.error).toEqual(new Error('There was an error'))
    })
  })

  describe('#deleteReports', () => {
    let expected, filenames

    beforeEach(() => {
      filenames = [
        '200716_1345_positives_with_locations.xlsx',
        '200716_1618_positives_with_locations.xlsx',
        '200716_1640_positives_with_locations.xlsx',
        '200716_1641_positives_with_locations.xlsx',
        '200716_1642_positives_with_locations.xlsx'
      ]
      mock = jest.spyOn(axios, 'post')
    })

    it('when it is successful', async () => {
      expected = { data: {} }
      mock.mockResolvedValue(expected)
      response = await lighthouse.deleteReports(filenames)
      expect(response.success).toBeTruthy()
    })

    it('when there is an error', async () => {
      mock.mockImplementationOnce(() =>
        Promise.reject(new Error('There was an error'))
      )
      response = await lighthouse.deleteReports()
      expect(response.success).toBeFalsy()
      expect(response.error).toEqual(new Error('There was an error'))
    })
  })

  describe('#getReports', () => {
    beforeEach(() => {
      mock = jest.spyOn(axios, 'get')
    })

    it('when the request is successful', async () => {
      axios.get.mockResolvedValue({ data: ReportsJson })

      response = await lighthouse.getReports()
      expect(response.success).toBeTruthy()
      expect(response.reports).toEqual(ReportsJson.reports)
    })

    it('when the request fails', async () => {
      axios.get.mockImplementationOnce(() =>
        Promise.reject(new Error('There was an error'))
      )

      response = await lighthouse.getReports()
      expect(response.success).toBeFalsy()
      expect(response.error).toEqual(new Error('There was an error'))
    })
  })

  describe('#createReport', () => {
    beforeEach(() => {
      mock = jest.spyOn(axios, 'post')
    })

    it('when the request is successful', async () => {
      axios.post.mockResolvedValue({
        data: { reports: [ReportsJson.reports[0]] }
      })
      response = await lighthouse.createReport()

      expect(response.success).toBeTruthy()
      expect(response.reports).toEqual([ReportsJson.reports[0]])
    })

    it('when the request fails', async () => {
      axios.post.mockImplementationOnce(() =>
        Promise.reject(new Error('There was an error'))
      )

      response = await lighthouse.createReport()

      expect(response.success).toBeFalsy()
      expect(response.error).toEqual(new Error('There was an error'))
    })
  })

  describe('#getRobots', () => {
    beforeEach(() => {
      mock = jest.spyOn(axios, 'get')
    })

    it('on success', async () => {
      response = { data: { errors: [], robots: RobotsJson.robots } }
      mock.mockResolvedValue(response)

      const result = await lighthouse.getRobots()
      const expected = { success: true, robots: RobotsJson.robots }

      expect(result).toEqual(expected)
    })

    it('on failure', async () => {
      axios.get.mockImplementationOnce(() =>
        Promise.reject({
          response: { data: { errors: ['There was an error'], robots: [] } }
        })
      )
      const result = await lighthouse.getRobots()
      const expected = {
        success: false,
        errors: ['There was an error'],
        robots: []
      }

      expect(result).toEqual(expected)
    })
  })

  describe('#getFailureTypes', () => {
    beforeEach(() => {
      mock = jest.spyOn(axios, 'get')
    })

    it('when the request is successful', async () => {
      response = {
        data: { failure_types: FailureTypesJson.failure_types, errors: [] }
      }
      mock.mockResolvedValue(response)

      const result = await lighthouse.getFailureTypes()
      const expected = {
        success: true,
        failure_types: FailureTypesJson.failure_types
      }

      expect(result).toEqual(expected)
    })

    it('on failure', async () => {
      axios.get.mockImplementationOnce(() =>
        Promise.reject({
          response: {
            data: { errors: ['There was an error'], failure_types: [] }
          }
        })
      )
      const result = await lighthouse.getFailureTypes()
      const expected = {
        success: false,
        errors: ['There was an error'],
        failure_types: []
      }

      expect(result).toEqual(expected)
    })
  })

  describe('#createDestinationPlate', () => {
    beforeEach(() => {
      mock = jest.spyOn(axios, 'get')
    })

    it('on success', async () => {
      const barcode = 'aBarcode'
      response = {
        data: {
          data: {
            plate_barcode: 'barcode',
            centre: 'centre_prefix',
            number_of_positives: 'len(samples)'
          }
        }
      }
      mock.mockResolvedValue(response)

      const responseData = response.data.data
      const result = await lighthouse.createDestinationPlate(
        'username',
        barcode,
        'x',
        'aType'
      )
      const expected = {
        success: true,
        response: `Successfully created destination plate, with barcode: ${responseData.plate_barcode}, and ${responseData.number_of_positives} positive sample(s)`
      }

      expect(result).toEqual(expected)
    })

    it('on failure', async () => {
      axios.get.mockImplementationOnce(() =>
        Promise.reject({
          response: { data: { errors: ['There was an error'] } }
        })
      )
      const result = await lighthouse.createDestinationPlate(
        'username',
        'aBarcode',
        'x',
        'aType'
      )

      const expected = { success: false, errors: ['There was an error'] }
      expect(result).toEqual(expected)
    })
  })

  describe('#failDestinationPlate', () => {
    beforeEach(() => {
      mock = jest.spyOn(axios, 'get')
    })

    it('on success', async () => {
      const barcode = 'aBarcode'
      response = { data: { errors: [] } }
      mock.mockResolvedValue(response)

      const result = await lighthouse.failDestinationPlate(
        'username',
        barcode,
        'x',
        'aType'
      )
      const expected = {
        success: true,
        response: `Successfully failed destination plate with barcode: ${barcode}`
      }

      expect(result).toEqual(expected)
    })

    it('on partial success', async () => {
      response = { data: { errors: ['some partial error message'] } }
      mock.mockResolvedValue(response)

      const result = await lighthouse.failDestinationPlate(
        'username',
        'aBarcode',
        'x',
        'aType'
      )
      const expected = { success: true, errors: ['some partial error message'] }

      expect(result).toEqual(expected)
    })

    it('on failure', async () => {
      axios.get.mockImplementationOnce(() =>
        Promise.reject({
          response: { data: { errors: ['There was an error'] } }
        })
      )
      const result = await lighthouse.failDestinationPlate(
        'username',
        'aBarcode',
        'x',
        'aType'
      )

      const expected = { success: false, errors: ['There was an error'] }
      expect(result).toEqual(expected)
    })
  })
})
