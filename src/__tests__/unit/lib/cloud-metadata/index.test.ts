import {CloudMetadata} from '../../../../lib';

import {ERRORS} from '../../../../util/errors';

const {InputValidationError, UnsupportedValueError} = ERRORS;

describe('lib/cloud-metadata:', () => {
  describe('CloudMetadata', () => {
    const cloudMetadata = CloudMetadata();

    describe('init: ', () => {
      it('successfully initalized.', () => {
        expect(cloudMetadata).toHaveProperty('metadata');
        expect(cloudMetadata).toHaveProperty('execute');
      });
    });

    describe('execute():', () => {
      it('returns a result with valid aws inputs.', async () => {
        const inputs = [
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 5,
            'cloud/instance-type': 'm5n.large',
            'cloud/vendor': 'aws',
          },
        ];
        const result = await cloudMetadata.execute(inputs);

        expect.assertions(1);

        expect(result).toStrictEqual([
          {
            timestamp: '2021-01-01T00:00:00Z',
            duration: 5,
            'cloud/instance-type': 'm5n.large',
            'cloud/vendor': 'aws',
            'physical-processor': 'Intel® Xeon® Platinum 8259CL',
            'vcpus-allocated': 2,
            'vcpus-total': 96,
            'memory-available': 8,
            'cpu/thermal-design-power': 210,
          },
        ]);
      });

      it('returns a result with valid azure inputs.', async () => {
        const inputs = [
          {
            timestamp: '',
            duration: 5,
            'cloud/instance-type': 'Standard_NC24-23s_v3',
            'cloud/vendor': 'azure',
          },
        ];

        const result = await cloudMetadata.execute(inputs);

        expect.assertions(1);

        expect(result).toStrictEqual([
          {
            timestamp: '',
            duration: 5,
            'cloud/instance-type': 'Standard_NC24-23s_v3',
            'cloud/vendor': 'azure',
            'physical-processor': 'Intel® Xeon® E5-2690 v4',
            'vcpus-allocated': 24,
            'vcpus-total': 28,
            'memory-available': 448,
            'cpu/thermal-design-power': 135,
          },
        ]);
      });

      it('throws on `cloud/instance-type` when `cloud/vendor` is aws.', async () => {
        const errorMessage =
          "CloudMetadata(cloud/instance-type): 't2.micro2' instance type is not supported in 'aws' cloud vendor.";
        const inputs = [
          {
            timestamp: '',
            duration: 5,
            'cloud/instance-type': 't2.micro2',
            'cloud/vendor': 'aws',
          },
        ];

        expect.assertions(2);

        try {
          await cloudMetadata.execute(inputs);
        } catch (error) {
          expect(error).toStrictEqual(new UnsupportedValueError(errorMessage));
          expect(error).toBeInstanceOf(UnsupportedValueError);
        }
      });

      it('throws on `cloud/instance-type` when `cloud/vendor` is azure.', async () => {
        const errorMessage =
          "CloudMetadata(cloud/instance-type): 't2.micro2' instance type is not supported in 'azure' cloud vendor.";
        const inputs = [
          {
            timestamp: '',
            duration: 5,
            'cloud/instance-type': 't2.micro2',
            'cloud/vendor': 'azure',
          },
        ];

        expect.assertions(2);

        try {
          await cloudMetadata.execute(inputs);
        } catch (error) {
          expect(error).toStrictEqual(new UnsupportedValueError(errorMessage));
          expect(error).toBeInstanceOf(UnsupportedValueError);
        }
      });

      it('throws on unsupported `cloud/vendor`.', async () => {
        const errorMessage =
          "\"cloud/vendor\" parameter is invalid enum value. expected 'aws' | 'azure', received 'aws2'. Error code: invalid_enum_value.";
        const inputs = [
          {
            timestamp: '',
            duration: 5,
            'cloud/instance-type': 't2.micro',
            'cloud/vendor': 'aws2',
          },
        ];

        expect.assertions(2);

        try {
          await cloudMetadata.execute(inputs);
        } catch (error) {
          expect(error).toStrictEqual(new InputValidationError(errorMessage));
          expect(error).toBeInstanceOf(InputValidationError);
        }
      });

      it('throws on missed required parameters.', async () => {
        const errorMessage =
          '"cloud/vendor" parameter is only aws,azure is currently supported. Error code: invalid_type.,"cloud/instance-type" parameter is required. Error code: invalid_type.';
        const inputs = [
          {
            timestamp: '',
            duration: 5,
          },
        ];

        expect.assertions(2);

        try {
          await cloudMetadata.execute(inputs);
        } catch (error) {
          expect(error).toStrictEqual(new InputValidationError(errorMessage));
          expect(error).toBeInstanceOf(InputValidationError);
        }
      });
    });
  });
});
