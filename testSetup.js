/* eslint-disable import/no-extraneous-dependencies */
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import enzymeToJsonSerializer from 'enzyme-to-json/serializer';

Enzyme.configure({ adapter: new Adapter() });

// Configure Jest snapshot serializers
expect.addSnapshotSerializer(enzymeToJsonSerializer);
